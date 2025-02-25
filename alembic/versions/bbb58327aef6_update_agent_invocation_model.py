"""update agent invocation model

Revision ID: bbb58327aef6
Revises: 5462fa9adda3
Create Date: 2025-02-14 21:36:07.443218

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bbb58327aef6'
down_revision = '5462fa9adda3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('agent_invocations', sa.Column('tokens_used', sa.Float(), nullable=True))
    op.add_column('agent_invocations', sa.Column('input_data', sa.String(), nullable=True))
    op.add_column('agent_invocations', sa.Column('output', sa.String(), nullable=True))
    op.add_column('agent_invocations', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.drop_column('agent_invocations', 'invocation_date')
    op.drop_column('agent_invocations', 'tokens_consumed')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('agent_invocations', sa.Column('tokens_consumed', sa.FLOAT(), nullable=True))
    op.add_column('agent_invocations', sa.Column('invocation_date', sa.DATETIME(), nullable=True))
    op.drop_column('agent_invocations', 'created_at')
    op.drop_column('agent_invocations', 'output')
    op.drop_column('agent_invocations', 'input_data')
    op.drop_column('agent_invocations', 'tokens_used')
    # ### end Alembic commands ###
