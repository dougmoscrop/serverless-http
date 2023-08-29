'use strict';

const { getEventType, LAMBDA_EVENT_TYPES } = require('../lib/provider/aws/get-event-type');
const expect = require('chai').expect;

describe('getEventType', function () {

    it('handles an ALB event', () => {
        const event = { requestContext: { elb: { arn: 'foo' } } };
        expect(getEventType(event)).to.equal(LAMBDA_EVENT_TYPES.ALB);
    });

    it('handles an HTTP_API_V2 event', () => {
        const event = { version: '2.0' };
        expect(getEventType(event)).to.equal(LAMBDA_EVENT_TYPES.HTTP_API_V2);
    });
    
    it('handles an HTTP_API_V1 event', () => {
        const event = { version: '1.0' };
        expect(getEventType(event)).to.equal(LAMBDA_EVENT_TYPES.HTTP_API_V1);
    });

  

});
