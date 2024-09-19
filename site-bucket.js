#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticSite = void 0;
const cdk = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");
const cloudfront = require("aws-cdk-lib/aws-cloudfront");
const origins = require("aws-cdk-lib/aws-cloudfront-origins");
const s3deploy = require("aws-cdk-lib/aws-s3-deployment");
const iam = require("aws-cdk-lib/aws-iam");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const path = require('path');
class StaticSite extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'cloudfront-OAI', {
            comment: `OAI for me`
        });
        // Content bucket
        const siteBucket = new s3.Bucket(this, 'SiteBucket', {
            bucketName: "gi-raphs-static-website-v2",
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            /**
             * The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
             * the new bucket, and it will remain in your account until manually deleted. By setting the policy to
             * DESTROY, cdk destroy will attempt to delete the bucket, but will error if the bucket is not empty.
             */
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            /**
             * For sample purposes only, if you create an S3 bucket then populate it, stack destruction fails.  This
             * setting will enable full cleanup of the demo.
             */
            autoDeleteObjects: true, // NOT recommended for production code
        });
        // Grant access to cloudfront
        siteBucket.addToResourcePolicy(new iam.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [siteBucket.arnForObjects('*')],
            principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
        }));
        new aws_cdk_lib_1.CfnOutput(this, 'Bucket', { value: siteBucket.bucketName });
        // CloudFront distribution
        const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
            defaultRootObject: "index.html",
            minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
            defaultBehavior: {
                origin: new origins.S3Origin(siteBucket, { originAccessIdentity: cloudfrontOAI }),
                compress: true,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            }
        });
        new aws_cdk_lib_1.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
        // Deploy site contents to S3 bucket
        new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
            sources: [s3deploy.Source.asset(path.join(__dirname, './dist'))],
            destinationBucket: siteBucket,
            distribution,
            distributionPaths: ['/*'],
        });
        // // Create a private S3 bucket
        // const bucket = new s3.Bucket(this, 'WebsiteBucket', {
        //   bucketName: 'gi-raphs-static-website-v2',
        //   publicReadAccess: false,
        //   blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        //   removalPolicy: cdk.RemovalPolicy.DESTROY,
        //   autoDeleteObjects: true,
        // });
        // const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity');
        // // Create a CloudFront distribution
        // const distribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
        //   defaultBehavior: {
        //     origin: new origins.S3Origin(bucket),
        //     viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        //     allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        //   },
        //   defaultRootObject: 'index.html',
        //   minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2019,
        // });
        // // Grant CloudFront access to the S3 bucket
        // bucket.grantRead(originAccessIdentity);
        // // Deploy the website to the S3 bucket
        // new s3deploy.BucketDeployment(this, 'WebsiteDeployment', {
        //   sources: [s3deploy.Source.asset('./dist')],
        //   destinationBucket: bucket,
        //   distribution,
        // });
        new cdk.CfnOutput(this, "CfnOutCloudFrontUrl", {
            value: `https://${distribution.distributionDomainName}`,
            description: "The CloudFront URL",
        });
    }
}
exports.StaticSite = StaticSite;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2l0ZS1idWNrZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzaXRlLWJ1Y2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBRUEsbUNBQW1DO0FBQ25DLHlDQUF5QztBQUN6Qyx5REFBeUQ7QUFDekQsOERBQThEO0FBQzlELDBEQUEwRDtBQUMxRCwyQ0FBMkM7QUFFM0MsNkNBQXdDO0FBQ3hDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUU3QixNQUFhLFVBQVcsU0FBUSxHQUFHLENBQUMsS0FBSztJQUV2QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sYUFBYSxHQUFHLElBQUksVUFBVSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUNoRixPQUFPLEVBQUUsWUFBWTtTQUN0QixDQUFDLENBQUM7UUFFSCxpQkFBaUI7UUFDakIsTUFBTSxVQUFVLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDbkQsVUFBVSxFQUFFLDRCQUE0QjtZQUN4QyxnQkFBZ0IsRUFBRSxLQUFLO1lBQ3ZCLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTO1lBRWpEOzs7O2VBSUc7WUFDSCxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBRXhDOzs7ZUFHRztZQUNILGlCQUFpQixFQUFFLElBQUksRUFBRSxzQ0FBc0M7U0FDaEUsQ0FBQyxDQUFDO1FBRUgsNkJBQTZCO1FBQzdCLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDckQsT0FBTyxFQUFFLENBQUMsY0FBYyxDQUFDO1lBQ3pCLFNBQVMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUMsVUFBVSxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsc0JBQXNCLENBQUMsYUFBYSxDQUFDLCtDQUErQyxDQUFDLENBQUM7U0FDNUcsQ0FBQyxDQUFDLENBQUM7UUFDSixJQUFJLHVCQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUVoRSwwQkFBMEI7UUFDMUIsTUFBTSxZQUFZLEdBQUcsSUFBSSxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUN6RSxpQkFBaUIsRUFBRSxZQUFZO1lBQy9CLHNCQUFzQixFQUFFLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxhQUFhO1lBQ3ZFLGVBQWUsRUFBRTtnQkFDZixNQUFNLEVBQUUsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxFQUFDLG9CQUFvQixFQUFFLGFBQWEsRUFBQyxDQUFDO2dCQUMvRSxRQUFRLEVBQUUsSUFBSTtnQkFDZCxjQUFjLEVBQUUsVUFBVSxDQUFDLGNBQWMsQ0FBQyxzQkFBc0I7Z0JBQ2hFLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUI7YUFDeEU7U0FDRixDQUFDLENBQUE7UUFFRixJQUFJLHVCQUFTLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLEVBQUUsS0FBSyxFQUFFLFlBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1FBRTlFLG9DQUFvQztRQUNwQyxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUU7WUFDNUQsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNoRSxpQkFBaUIsRUFBRSxVQUFVO1lBQzdCLFlBQVk7WUFDWixpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQztTQUMxQixDQUFDLENBQUM7UUFFSCxnQ0FBZ0M7UUFDaEMsd0RBQXdEO1FBQ3hELDhDQUE4QztRQUM5Qyw2QkFBNkI7UUFDN0IsdURBQXVEO1FBQ3ZELDhDQUE4QztRQUM5Qyw2QkFBNkI7UUFDN0IsTUFBTTtRQUVOLGtHQUFrRztRQUNsRyxzQ0FBc0M7UUFDdEMsa0ZBQWtGO1FBQ2xGLHVCQUF1QjtRQUN2Qiw0Q0FBNEM7UUFDNUMsK0VBQStFO1FBQy9FLHdFQUF3RTtRQUN4RSxPQUFPO1FBQ1AscUNBQXFDO1FBQ3JDLDZFQUE2RTtRQUM3RSxNQUFNO1FBRU4sOENBQThDO1FBQzlDLDBDQUEwQztRQUUxQyx5Q0FBeUM7UUFDekMsNkRBQTZEO1FBQzdELGdEQUFnRDtRQUNoRCwrQkFBK0I7UUFDL0Isa0JBQWtCO1FBQ2xCLE1BQU07UUFFTixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQzdDLEtBQUssRUFBRSxXQUFXLFlBQVksQ0FBQyxzQkFBc0IsRUFBRTtZQUN2RCxXQUFXLEVBQUUsb0JBQW9CO1NBQ2xDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQTlGRCxnQ0E4RkMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBzMyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xuaW1wb3J0ICogYXMgY2xvdWRmcm9udCBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udCc7XG5pbXBvcnQgKiBhcyBvcmlnaW5zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZGZyb250LW9yaWdpbnMnO1xuaW1wb3J0ICogYXMgczNkZXBsb3kgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzLWRlcGxveW1lbnQnO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBDZm5PdXRwdXQgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5leHBvcnQgY2xhc3MgU3RhdGljU2l0ZSBleHRlbmRzIGNkay5TdGFjayB7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuICAgIGNvbnN0IGNsb3VkZnJvbnRPQUkgPSBuZXcgY2xvdWRmcm9udC5PcmlnaW5BY2Nlc3NJZGVudGl0eSh0aGlzLCAnY2xvdWRmcm9udC1PQUknLCB7XG4gICAgICBjb21tZW50OiBgT0FJIGZvciBtZWBcbiAgICB9KTtcblxuICAgIC8vIENvbnRlbnQgYnVja2V0XG4gICAgY29uc3Qgc2l0ZUJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ1NpdGVCdWNrZXQnLCB7XG4gICAgICBidWNrZXROYW1lOiBcImdpLXJhcGhzLXN0YXRpYy13ZWJzaXRlLXYyXCIsXG4gICAgICBwdWJsaWNSZWFkQWNjZXNzOiBmYWxzZSxcbiAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIGRlZmF1bHQgcmVtb3ZhbCBwb2xpY3kgaXMgUkVUQUlOLCB3aGljaCBtZWFucyB0aGF0IGNkayBkZXN0cm95IHdpbGwgbm90IGF0dGVtcHQgdG8gZGVsZXRlXG4gICAgICAgKiB0aGUgbmV3IGJ1Y2tldCwgYW5kIGl0IHdpbGwgcmVtYWluIGluIHlvdXIgYWNjb3VudCB1bnRpbCBtYW51YWxseSBkZWxldGVkLiBCeSBzZXR0aW5nIHRoZSBwb2xpY3kgdG9cbiAgICAgICAqIERFU1RST1ksIGNkayBkZXN0cm95IHdpbGwgYXR0ZW1wdCB0byBkZWxldGUgdGhlIGJ1Y2tldCwgYnV0IHdpbGwgZXJyb3IgaWYgdGhlIGJ1Y2tldCBpcyBub3QgZW1wdHkuXG4gICAgICAgKi9cbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksIC8vIE5PVCByZWNvbW1lbmRlZCBmb3IgcHJvZHVjdGlvbiBjb2RlXG5cbiAgICAgIC8qKlxuICAgICAgICogRm9yIHNhbXBsZSBwdXJwb3NlcyBvbmx5LCBpZiB5b3UgY3JlYXRlIGFuIFMzIGJ1Y2tldCB0aGVuIHBvcHVsYXRlIGl0LCBzdGFjayBkZXN0cnVjdGlvbiBmYWlscy4gIFRoaXNcbiAgICAgICAqIHNldHRpbmcgd2lsbCBlbmFibGUgZnVsbCBjbGVhbnVwIG9mIHRoZSBkZW1vLlxuICAgICAgICovXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSwgLy8gTk9UIHJlY29tbWVuZGVkIGZvciBwcm9kdWN0aW9uIGNvZGVcbiAgICB9KTtcblxuICAgIC8vIEdyYW50IGFjY2VzcyB0byBjbG91ZGZyb250XG4gICAgc2l0ZUJ1Y2tldC5hZGRUb1Jlc291cmNlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGFjdGlvbnM6IFsnczM6R2V0T2JqZWN0J10sXG4gICAgICByZXNvdXJjZXM6IFtzaXRlQnVja2V0LmFybkZvck9iamVjdHMoJyonKV0sXG4gICAgICBwcmluY2lwYWxzOiBbbmV3IGlhbS5DYW5vbmljYWxVc2VyUHJpbmNpcGFsKGNsb3VkZnJvbnRPQUkuY2xvdWRGcm9udE9yaWdpbkFjY2Vzc0lkZW50aXR5UzNDYW5vbmljYWxVc2VySWQpXVxuICAgIH0pKTtcbiAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdCdWNrZXQnLCB7IHZhbHVlOiBzaXRlQnVja2V0LmJ1Y2tldE5hbWUgfSk7XG5cbiAgICAvLyBDbG91ZEZyb250IGRpc3RyaWJ1dGlvblxuICAgIGNvbnN0IGRpc3RyaWJ1dGlvbiA9IG5ldyBjbG91ZGZyb250LkRpc3RyaWJ1dGlvbih0aGlzLCAnU2l0ZURpc3RyaWJ1dGlvbicsIHtcbiAgICAgIGRlZmF1bHRSb290T2JqZWN0OiBcImluZGV4Lmh0bWxcIixcbiAgICAgIG1pbmltdW1Qcm90b2NvbFZlcnNpb246IGNsb3VkZnJvbnQuU2VjdXJpdHlQb2xpY3lQcm90b2NvbC5UTFNfVjFfMl8yMDIxLFxuICAgICAgZGVmYXVsdEJlaGF2aW9yOiB7XG4gICAgICAgIG9yaWdpbjogbmV3IG9yaWdpbnMuUzNPcmlnaW4oc2l0ZUJ1Y2tldCwge29yaWdpbkFjY2Vzc0lkZW50aXR5OiBjbG91ZGZyb250T0FJfSksXG4gICAgICAgIGNvbXByZXNzOiB0cnVlLFxuICAgICAgICBhbGxvd2VkTWV0aG9kczogY2xvdWRmcm9udC5BbGxvd2VkTWV0aG9kcy5BTExPV19HRVRfSEVBRF9PUFRJT05TLFxuICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgbmV3IENmbk91dHB1dCh0aGlzLCAnRGlzdHJpYnV0aW9uSWQnLCB7IHZhbHVlOiBkaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uSWQgfSk7XG5cbiAgICAvLyBEZXBsb3kgc2l0ZSBjb250ZW50cyB0byBTMyBidWNrZXRcbiAgICBuZXcgczNkZXBsb3kuQnVja2V0RGVwbG95bWVudCh0aGlzLCAnRGVwbG95V2l0aEludmFsaWRhdGlvbicsIHtcbiAgICAgIHNvdXJjZXM6IFtzM2RlcGxveS5Tb3VyY2UuYXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgJy4vZGlzdCcpKV0sXG4gICAgICBkZXN0aW5hdGlvbkJ1Y2tldDogc2l0ZUJ1Y2tldCxcbiAgICAgIGRpc3RyaWJ1dGlvbixcbiAgICAgIGRpc3RyaWJ1dGlvblBhdGhzOiBbJy8qJ10sXG4gICAgfSk7XG5cbiAgICAvLyAvLyBDcmVhdGUgYSBwcml2YXRlIFMzIGJ1Y2tldFxuICAgIC8vIGNvbnN0IGJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ1dlYnNpdGVCdWNrZXQnLCB7XG4gICAgLy8gICBidWNrZXROYW1lOiAnZ2ktcmFwaHMtc3RhdGljLXdlYnNpdGUtdjInLFxuICAgIC8vICAgcHVibGljUmVhZEFjY2VzczogZmFsc2UsXG4gICAgLy8gICBibG9ja1B1YmxpY0FjY2VzczogczMuQmxvY2tQdWJsaWNBY2Nlc3MuQkxPQ0tfQUxMLFxuICAgIC8vICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAvLyAgIGF1dG9EZWxldGVPYmplY3RzOiB0cnVlLFxuICAgIC8vIH0pO1xuXG4gICAgLy8gY29uc3Qgb3JpZ2luQWNjZXNzSWRlbnRpdHkgPSBuZXcgY2xvdWRmcm9udC5PcmlnaW5BY2Nlc3NJZGVudGl0eSh0aGlzLCAnT3JpZ2luQWNjZXNzSWRlbnRpdHknKTtcbiAgICAvLyAvLyBDcmVhdGUgYSBDbG91ZEZyb250IGRpc3RyaWJ1dGlvblxuICAgIC8vIGNvbnN0IGRpc3RyaWJ1dGlvbiA9IG5ldyBjbG91ZGZyb250LkRpc3RyaWJ1dGlvbih0aGlzLCAnV2Vic2l0ZURpc3RyaWJ1dGlvbicsIHtcbiAgICAvLyAgIGRlZmF1bHRCZWhhdmlvcjoge1xuICAgIC8vICAgICBvcmlnaW46IG5ldyBvcmlnaW5zLlMzT3JpZ2luKGJ1Y2tldCksXG4gICAgLy8gICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgIC8vICAgICBhbGxvd2VkTWV0aG9kczogY2xvdWRmcm9udC5BbGxvd2VkTWV0aG9kcy5BTExPV19HRVRfSEVBRF9PUFRJT05TLFxuICAgIC8vICAgfSxcbiAgICAvLyAgIGRlZmF1bHRSb290T2JqZWN0OiAnaW5kZXguaHRtbCcsXG4gICAgLy8gICBtaW5pbXVtUHJvdG9jb2xWZXJzaW9uOiBjbG91ZGZyb250LlNlY3VyaXR5UG9saWN5UHJvdG9jb2wuVExTX1YxXzJfMjAxOSxcbiAgICAvLyB9KTtcblxuICAgIC8vIC8vIEdyYW50IENsb3VkRnJvbnQgYWNjZXNzIHRvIHRoZSBTMyBidWNrZXRcbiAgICAvLyBidWNrZXQuZ3JhbnRSZWFkKG9yaWdpbkFjY2Vzc0lkZW50aXR5KTtcblxuICAgIC8vIC8vIERlcGxveSB0aGUgd2Vic2l0ZSB0byB0aGUgUzMgYnVja2V0XG4gICAgLy8gbmV3IHMzZGVwbG95LkJ1Y2tldERlcGxveW1lbnQodGhpcywgJ1dlYnNpdGVEZXBsb3ltZW50Jywge1xuICAgIC8vICAgc291cmNlczogW3MzZGVwbG95LlNvdXJjZS5hc3NldCgnLi9kaXN0JyldLFxuICAgIC8vICAgZGVzdGluYXRpb25CdWNrZXQ6IGJ1Y2tldCxcbiAgICAvLyAgIGRpc3RyaWJ1dGlvbixcbiAgICAvLyB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiQ2ZuT3V0Q2xvdWRGcm9udFVybFwiLCB7XG4gICAgICB2YWx1ZTogYGh0dHBzOi8vJHtkaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uRG9tYWluTmFtZX1gLFxuICAgICAgZGVzY3JpcHRpb246IFwiVGhlIENsb3VkRnJvbnQgVVJMXCIsXG4gICAgfSk7XG4gIH1cbn0iXX0=