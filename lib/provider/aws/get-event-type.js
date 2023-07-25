const HTTP_API_V1 = 'HTTP_API_V1';
const HTTP_API_V2 = 'HTTP_API_V2';
const ALB = 'ALB';

const LAMBDA_EVENT_TYPES = {
    HTTP_API_V1,
    HTTP_API_V2,
    ALB
}

const getEventType = (event) => {
    if (event.requestContext && event.requestContext.elb) {
    // https://docs.aws.amazon.com/elasticloadbalancing/latest/application/lambda-functions.html
        return ALB;
    } else if (event.version === '2.0') {
    // https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.v2
        return HTTP_API_V2;
    } else {
    // https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.v2
        return HTTP_API_V1;
    }
}

module.exports = {
    getEventType,
    LAMBDA_EVENT_TYPES
}