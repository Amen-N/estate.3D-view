"""Create system_audit_logs table

Revision ID: 0005_create_system_audit_logs
Revises: 0004_create_showroom_tables
Create Date: 2026-10-08 17:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0005_create_system_audit_logs'
down_revision: Union[str, None] = '0004_create_showroom_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'system_audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('resource_type', sa.String(length=100), nullable=False),
        sa.Column('resource_id', sa.String(length=255), nullable=True),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'{}'::jsonb"), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_system_audit_logs_user_id'), 'system_audit_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_system_audit_logs_action'), 'system_audit_logs', ['action'], unique=False)
    op.create_index(op.f('ix_system_audit_logs_resource_type'), 'system_audit_logs', ['resource_type'], unique=False)
    op.create_index(op.f('ix_system_audit_logs_created_at'), 'system_audit_logs', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_system_audit_logs_created_at'), table_name='system_audit_logs')
    op.drop_index(op.f('ix_system_audit_logs_resource_type'), table_name='system_audit_logs')
    op.drop_index(op.f('ix_system_audit_logs_action'), table_name='system_audit_logs')
    op.drop_index(op.f('ix_system_audit_logs_user_id'), table_name='system_audit_logs')
    op.drop_table('system_audit_logs')
