using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.ALTER_MOVEMENT_TYPE_COLUMN, "Change Type column from smallint to int")]
    public class Version0000009: ForwardOnlyMigration
    {
        public override void Up()
        {
            Alter.Column("Type")
                .OnTable("Movements")
                .AsInt32()
                .NotNullable();
        }
    }
}
