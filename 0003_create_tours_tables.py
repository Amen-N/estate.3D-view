"""Create agent_availability and property_tours tables with GIST exclusion constraint

Revision ID: 0003_create_tours_tables
Revises: 0002_create_properties_table
Create Date: 2026-10-06 14:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0003_create_tours_tables'
down_revision: Union[str, None] = '0002_create_properties_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 0. Ensure btree_gist extension is enabled for multi-column GIST constraints
    op.execute("CREATE EXTENSION IF NOT EXISTS btree_gist;")

    # 1. Create agent_availability table
    op.create_table(
        'agent_availability',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('agent_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('day_of_week', sa.Integer(), nullable=False),
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
        sa.Column('slot_duration_minutes', sa.Integer(), server_default='45', nullable=False),
        sa.Column('buffer_minutes', sa.Integer(), server_default='15', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.CheckConstraint('day_of_week >= 0 AND day_of_week <= 6', name='check_valid_day_of_week'),
        sa.ForeignKeyConstraint(['agent_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('agent_id', 'day_of_week', 'start_time', 'end_time', name='unique_agent_schedule')
    )
    op.create_index(op.f('ix_agent_availability_agent_id'), 'agent_availability', ['agent_id'], unique=False)

    # 2. Create property_tours table
    op.create_table(
        'property_tours',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('property_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('buyer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('agent_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('scheduled_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('scheduled_end', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.String(length=25), server_default='confirmed', nullable=False),
        sa.Column('cancellation_reason', sa.Text(), nullable=True),
        sa.Column('buyer_notes', sa.Text(), nullable=True),
        sa.Column('agent_feedback', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['buyer_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['agent_id'], ['users.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_property_tours_property_id'), 'property_tours', ['property_id'], unique=False)
    op.create_index(op.f('ix_property_tours_buyer_id'), 'property_tours', ['buyer_id'], unique=False)
    op.create_index(op.f('ix_property_tours_agent_id'), 'property_tours', ['agent_id'], unique=False)
    op.create_index(op.f('ix_property_tours_scheduled_start'), 'property_tours', ['scheduled_start'], unique=False)
    op.create_index(op.f('ix_property_tours_status'), 'property_tours', ['status'], unique=False)

    # 3. Add PostgreSQL GIST exclusion constraint directly
    op.execute("""
        ALTER TABLE property_tours ADD CONSTRAINT prevent_overlapping_agent_tours 
        EXCLUDE USING gist (
            agent_id WITH =,
            tstzrange(scheduled_start, scheduled_end) WITH &&
        ) WHERE (status IN ('pending', 'confirmed'));
    """)


def downgrade() -> None:
    op.execute("ALTER TABLE property_tours DROP CONSTRAINT IF EXISTS prevent_overlapping_agent_tours;")
    op.drop_index(op.f('ix_property_tours_status'), table_name='property_tours')
    op.drop_index(op.f('ix_property_tours_scheduled_start'), table_name='property_tours')
    op.drop_index(op.f('ix_property_tours_agent_id'), table_name='property_tours')
    op.drop_index(op.f('ix_property_tours_buyer_id'), table_name='property_tours')
    op.drop_index(op.f('ix_property_tours_property_id'), table_name='property_tours')
    op.drop_table('property_tours')
    op.drop_index(op.f('ix_agent_availability_agent_id'), table_name='agent_availability')
    op.drop_table('agent_availability')
