'use strict';

const { createComment, getCommentsByParentId } = require('../services/comment.service');
const { SuccessResponse } = require("../core/success.response");

class CommentController {
    createComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create comment successfully',
            metadata: await createComment(req.body)
        }).send(res);
    }

    getCommentsByParentId = async (req, res, next) => {
        new SuccessResponse({
            message: 'get comments successfully',
            metadata: await getCommentsByParentId(req.query)
        }).send(res);
    }
}

module.exports = new CommentController