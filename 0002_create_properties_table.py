"""Create properties table with PostGIS geometry and GIST spatial index

Revision ID: 0002_create_properties_table
Revises: 0001_create_users_table
Create Date: 2026-10-02 18:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from geoalchemy2 import Geometry

# revision identifiers, used by Alembic.
revision: str = '0002_create_properties_table'
down_revision: Union[str, None] = '0001_create_users_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create properties table (GeoAlchemy2 automatically provisions idx_properties_location)
    op.create_table(
        'properties',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('agent_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column('property_type', sa.String(length=50), server_default='condo', nullable=False),
        sa.Column('status', sa.String(length=20), server_default='published', nullable=False),
        sa.Column('bedrooms', sa.Integer(), server_default='1', nullable=False),
        sa.Column('bathrooms', sa.Integer(), server_default='1', nullable=False),
        sa.Column('area_sqft', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('address', sa.String(length=255), nullable=False),
        sa.Column('city', sa.String(length=100), nullable=False),
        sa.Column('state', sa.String(length=100), nullable=True),
        sa.Column('zip_code', sa.String(length=20), nullable=True),
        sa.Column('location', Geometry(geometry_type='POINT', srid=4326, spatial_index=True), nullable=True),
        sa.Column('has_virtual_showroom', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('featured_image_url', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['agent_id'], ['users.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )
    op.create_index(op.f('ix_properties_slug'), 'properties', ['slug'], unique=True)
    op.create_index(op.f('ix_properties_price'), 'properties', ['price'], unique=False)
    op.create_index(op.f('ix_properties_city'), 'properties', ['city'], unique=False)
    op.create_index(op.f('ix_properties_has_virtual_showroom'), 'properties', ['has_virtual_showroom'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_properties_has_virtual_showroom'), table_name='properties')
    op.drop_index(op.f('ix_properties_city'), table_name='properties')
    op.drop_index(op.f('ix_properties_price'), table_name='properties')
    op.drop_index(op.f('ix_properties_slug'), table_name='properties')
    op.drop_table('properties')
