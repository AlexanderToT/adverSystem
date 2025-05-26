/**
 * 响应状态码
 */
export var ResponseCode;
(function (ResponseCode) {
    ResponseCode[ResponseCode["SUCCESS"] = 200] = "SUCCESS";
    ResponseCode[ResponseCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    ResponseCode[ResponseCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    ResponseCode[ResponseCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    ResponseCode[ResponseCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    ResponseCode[ResponseCode["INTERNAL_ERROR"] = 500] = "INTERNAL_ERROR";
})(ResponseCode || (ResponseCode = {}));
/**
 * 创建成功响应
 * @param data 响应数据
 * @param message 成功消息
 * @param code 状态码
 */
export function createSuccessResponse(data, message = "请求成功", code = ResponseCode.SUCCESS) {
    return {
        code,
        data,
        message
    };
}
/**
 * 创建错误响应
 * @param message 错误消息
 * @param code 状态码
 */
export function createErrorResponse(message = "请求失败", code = ResponseCode.INTERNAL_ERROR) {
    return {
        code,
        message
    };
}
/**
 * 返回成功响应
 */
export function success(c, data, message = "请求成功", code = ResponseCode.SUCCESS, httpStatus = 200) {
    return c.json(createSuccessResponse(data, message, code), httpStatus);
}
/**
 * 返回错误响应
 */
export function error(c, message = "请求失败", code = ResponseCode.INTERNAL_ERROR, httpStatus = 500) {
    return c.json(createErrorResponse(message, code), httpStatus);
}
