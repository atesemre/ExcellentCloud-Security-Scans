var expect = require('chai').expect;
var backupInUseForRDSSnapshots = require('./backupInUseForRDSSnapshots');

const describeDBSnapshots = [
 
        {
            "DBSnapshotIdentifier": "database-1-final-snapshot",
            "DBInstanceIdentifier": "database-1",
            "SnapshotCreateTime": "2022-01-24T15:41:26.234000+00:00",
            "Engine": "mariadb",
            "AllocatedStorage": 20,
            "Status": "available",
            "Port": 3306,
            "AvailabilityZone": "us-east-1a",
            "VpcId": "vpc-0f4f4575a74fac014",
            "InstanceCreateTime": "2022-01-24T15:27:38.423000+00:00",
            "MasterUsername": "admin",
            "EngineVersion": "10.5.13",
            "LicenseModel": "general-public-license",
            "SnapshotType": "awsbackup",
            "OptionGroupName": "default:mariadb-10-5",
            "PercentProgress": 100,
            "StorageType": "gp2",
            "Encrypted": false,
            "DBSnapshotArn": "arn:aws:rds:us-east-1:101363889637:snapshot:database-1-final-snapshot",
            "IAMDatabaseAuthenticationEnabled": false,
            "ProcessorFeatures": [],
            "DbiResourceId": "db-AVTEMNYVJCF3INR3EROOHGZXQQ",
            "TagList": [],
            "OriginalSnapshotCreateTime": "2022-01-24T15:41:26.234000+00:00"
      
  },
  {}
];


const createCache = (snapshots, snapshotsErr) => {
    
    return {
        rds: {
            describeDBSnapshots: {
                'us-east-1': {
                    err: snapshotsErr,
                    data: snapshots
                },
            }
        },
    };
};

describe('backupInUseForRDSSnapshots', function () {
    describe('run', function () {
        it('should PASS if Amazon Backup is in use for Amazon RDS to take snapshots in the selected region.', function (done) {
            const cache = createCache([describeDBSnapshots[0]]);
            backupInUseForRDSSnapshots.run(cache, {}, (err, results) => {
              console.log(results);
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(0);
                expect(results[0].region).to.equal('us-east-1');
                done();
            });
        });

        it('should FAIL if Amazon Backup is not in use for Amazon RDS to take snapshots in the selected region.', function (done) {
            const cache = createCache([describeDBSnapshots[1]]);
            backupInUseForRDSSnapshots.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(2);
                expect(results[0].region).to.equal('us-east-1');
                done();
            });
        });

        it('should PASS if no RDS snapshots found', function (done) {
            const cache = createCache([]);
            backupInUseForRDSSnapshots.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(0);
                expect(results[0].region).to.equal('us-east-1');
                done();
            });
        });

        it('should UNKNOWN if Unable to query for RDS snapshots', function (done) {
            const cache = createCache(null, null, null, { message: "Unable to query for RDS snapshots" });
            backupInUseForRDSSnapshots.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(3);
                expect(results[0].region).to.equal('us-east-1');
                done();
            });
        });
    });
})