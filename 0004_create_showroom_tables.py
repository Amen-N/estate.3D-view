"""Create showrooms, showroom_scenes, and showroom_hotspots tables

Revision ID: 0004_create_showroom_tables
Revises: 0003_create_tours_tables
Create Date: 2026-10-07 18:20:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0004_create_showroom_tables'
down_revision: Union[str, None] = '0003_create_tours_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create showrooms table
    op.create_table(
        'showrooms',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('property_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('showroom_mode', sa.String(length=20), server_default='both', nullable=False),
        sa.Column('model_3d_url', sa.Text(), nullable=True),
        sa.Column('model_config', postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'{}'::jsonb"), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('property_id', name='uq_showrooms_property_id')
    )
    op.create_index(op.f('ix_showrooms_property_id'), 'showrooms', ['property_id'], unique=True)

    # 2. Create showroom_scenes table
    op.create_table(
        'showroom_scenes',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('showroom_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('room_name', sa.String(length=100), nullable=False),
        sa.Column('panorama_url', sa.Text(), nullable=False),
        sa.Column('thumbnail_url', sa.Text(), nullable=True),
        sa.Column('default_pitch', sa.Numeric(precision=6, scale=3), server_default='0.0', nullable=False),
        sa.Column('default_yaw', sa.Numeric(precision=6, scale=3), server_default='0.0', nullable=False),
        sa.Column('sort_order', sa.Integer(), server_default='0', nullable=False),
        sa.Column('is_initial_scene', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['showroom_id'], ['showrooms.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_showroom_scenes_showroom_id'), 'showroom_scenes', ['showroom_id'], unique=False)

    # 3. Create showroom_hotspots table
    op.create_table(
        'showroom_hotspots',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('scene_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('hotspot_type', sa.String(length=20), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('pitch', sa.Numeric(precision=6, scale=3), nullable=False),
        sa.Column('yaw', sa.Numeric(precision=6, scale=3), nullable=False),
        sa.Column('target_scene_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'{}'::jsonb"), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint('pitch >= -90.0 AND pitch <= 90.0', name='check_hotspot_pitch_bounds'),
        sa.CheckConstraint('yaw >= -180.0 AND yaw <= 180.0', name='check_hotspot_yaw_bounds'),
        sa.ForeignKeyConstraint(['scene_id'], ['showroom_scenes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['target_scene_id'], ['showroom_scenes.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_showroom_hotspots_scene_id'), 'showroom_hotspots', ['scene_id'], unique=False)
    op.create_index(op.f('ix_showroom_hotspots_target_scene_id'), 'showroom_hotspots', ['target_scene_id'], unique=False)


def downgrade() -> None:
    op.drop_table('showroom_hotspots')
    op.drop_table('showroom_scenes')
    op.drop_table('showrooms')
