/**
 * Operate Demo - 禁用与禁用打开
 */
import React from "react";
import { Space, Button } from "antd";
import { createOperate } from "@kachina/biz";
import type { ContentProps } from "@kachina/biz";

const InfoContent = ({ params, closeModal, disabled }: ContentProps) => (
  <div>
    <p>当前操作对象：{params?.label}</p>
    <p>弹窗禁用态：{disabled ? "是" : "否"}</p>
    <Button onClick={closeModal} style={{ marginTop: 8 }}>关闭</Button>
  </div>
);

const InfoOperate = createOperate({
  content: InfoContent,
  fieldNames: { label: "label", value: "id" },
  touchType: "button",
});

export default () => {
  return (
    <div>
      <h4>禁用组合演示</h4>
      <table style={{ borderCollapse: "collapse", marginBottom: 16 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>disabled</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>disableOpen</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>效果</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>false</td>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>—</td>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>触发器可点击，弹窗正常打开</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>true</td>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>false（默认）</td>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>触发器禁用样式，但点击仍可打开弹窗（只读模式）</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>true</td>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>true</td>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>触发器禁用样式，点击不会打开弹窗</td>
          </tr>
        </tbody>
      </table>

      <Space>
        <InfoOperate params={{ label: "正常按钮" }}>正常按钮</InfoOperate>
        <InfoOperate disabled disableOpen params={{ label: "禁用但可打开" }}>
          禁用但可打开
        </InfoOperate>
        <InfoOperate disabled params={{ label: "完全禁用" }}>
          完全禁用
        </InfoOperate>
      </Space>
    </div>
  );
};
