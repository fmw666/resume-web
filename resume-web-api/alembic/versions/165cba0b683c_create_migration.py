"""create migration

Revision ID: 165cba0b683c
Revises: 9e043c8627c2
Create Date: 2023-10-11 15:21:11.818986

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '165cba0b683c'
down_revision = '9e043c8627c2'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('info', sa.Column('wechat_url', sa.String(length=32), nullable=True))
    op.add_column('info', sa.Column('github_url', sa.String(length=32), nullable=True))
    op.drop_column('info', 'wechat_account')
    op.drop_column('info', 'github_account')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('info', sa.Column('github_account', sa.VARCHAR(length=32), nullable=True))
    op.add_column('info', sa.Column('wechat_account', sa.VARCHAR(length=32), nullable=True))
    op.drop_column('info', 'github_url')
    op.drop_column('info', 'wechat_url')
    # ### end Alembic commands ###
