"""add position to task

Revision ID: 0001
Revises: 
Create Date: 2025-09-30 00:00:00

"""
from alembic import op
import sqlalchemy as sa


revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('task', sa.Column('position', sa.Integer(), nullable=False, server_default='0'))
    op.alter_column('task', 'position', server_default=None)


def downgrade() -> None:
    op.drop_column('task', 'position')


