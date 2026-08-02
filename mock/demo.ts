import type { Request, Response } from 'express';

// Umi mock 约定：export default 一个对象，key 为 "METHOD /api/path"
export default {
  // 直接返回数据
  'GET /api/health': { status: 'ok', timestamp: Date.now() },

  // 函数式 handler，支持 req / res
  'POST /api/form/submit': (req: Request, res: Response) => {
    const body = req.body;
    res.json({
      code: 0,
      message: '提交成功',
      data: { id: Date.now(), ...body },
    });
  },

  // RESTful 参数
  'GET /api/users/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({
      code: 0,
      data: { id, name: `用户 ${id}`, email: `${id}@example.com` },
    });
  },
};