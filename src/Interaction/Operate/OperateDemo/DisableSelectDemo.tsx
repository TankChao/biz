/**
 * Operate Demo - 禁用与禁用打开（touchType = select，多选）
 */
import React, { useState } from "react";
import { Button, Descriptions, Divider } from "antd";
import { setOperateConfig, Operate } from "@kachina/biz";
import type { ContentProps } from "@kachina/biz";

const roleList = [
  { roleCode: "admin", roleName: "管理员", roleDesc: "拥有全部权限" },
  { roleCode: "editor", roleName: "编辑者", roleDesc: "可编辑内容" },
  { roleCode: "viewer", roleName: "查看者", roleDesc: "仅可查看" },
  { roleCode: "guest", roleName: "访客", roleDesc: "有限访问" },
];

const RoleSelectContent = ({ onChange, closeModal, disabled }: ContentProps) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleConfirm = () => {
    const items = roleList.filter((r) => selected.includes(r.roleCode));
    onChange(selected, items);
    closeModal();
  };

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        {"弹窗禁用态："}{disabled ? "是" : "否"}
      </div>
      <div style={{ marginBottom: 16 }}>{"请选择角色（可多选）："}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {roleList.map((role) => (
          <label key={role.roleCode} style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              disabled={disabled}
              checked={selected.includes(role.roleCode)}
              onChange={() => {
                setSelected((prev) =>
                  prev.includes(role.roleCode)
                    ? prev.filter((id) => id !== role.roleCode)
                    : [...prev, role.roleCode],
                );
              }}
            />
            <span style={{ marginLeft: 8 }}>
              {role.roleName}{"（"}{role.roleDesc}{"）"}
            </span>
          </label>
        ))}
      </div>
      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Button onClick={closeModal} style={{ marginRight: 8 }}>{"取消"}</Button>
        <Button type="primary" onClick={handleConfirm} disabled={disabled}>
          {"确认（已选 "}{selected.length}{" 项）"}
        </Button>
      </div>
    </div>
  );
};

const RoleOperate = setOperateConfig(Operate, {
  content: RoleSelectContent,
  fieldNames: { label: "roleName", value: "roleCode" },
  touchType: "select",
  valueType: "Key[]",
  multiple: true,
});

export default () => {
  const [val1, setVal1] = useState<string[]>([]);
  const [val2, setVal2] = useState<string[]>(["admin","editor"]);
  const [val3, setVal3] = useState<string[]>([]);

  return (
    <div>
      <h4>{"Select 触发器 - 禁用组合演示（多选）"}</h4>
      <table style={{ borderCollapse: "collapse", marginBottom: 16 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>disabled</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>disableOpen</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>{"效果"}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>false</td>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>{"—"}</td>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>
              {"Select 可点击，弹窗正常打开，可多选"}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>true</td>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>{"false（默认）"}</td>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>
              {"Select 禁用样式，但点击仍可打开弹窗（只读模式）"}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>true</td>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>true</td>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>
              {"Select 禁用样式，点击不会打开弹窗"}
            </td>
          </tr>
        </tbody>
      </table>

      <Divider>{"正常 Select（多选）"}</Divider>
      <RoleOperate
        value={val1}
        onChange={(val, opts) => {
          console.log("onChange:", val, opts);
          setVal1(val);
        }}
        titleModal={"选择角色"}
        placeholder={"请选择角色"}
        defaultOptions={roleList}
        selectProps={{ style: { width: 360 } }}
      />
      <Descriptions size="small" column={1} style={{ marginTop: 8 }}>
        <Descriptions.Item label={"当前值"}>
          {val1.length > 0 ? JSON.stringify(val1) : "未选择"}
        </Descriptions.Item>
      </Descriptions>

      <Divider>{"禁用但可打开弹窗（只读模式）"}</Divider>
      <RoleOperate
        disabled
        disableOpen
        value={val2}
        onChange={(val, opts) => {
          console.log("onChange:", val, opts);
          setVal2(val);
        }}
        titleModal={"选择角色（只读）"}
        placeholder={"请选择角色"}
        defaultOptions={roleList}
        selectProps={{ style: { width: 360 } }}
      />
      <Descriptions size="small" column={1} style={{ marginTop: 8 }}>
        <Descriptions.Item label={"当前值"}>
          {val2.length > 0 ? JSON.stringify(val2) : "未选择"}
        </Descriptions.Item>
      </Descriptions>

      <Divider>{"完全禁用（不可打开弹窗）"}</Divider>
      <RoleOperate
        disabled
        value={val3}
        onChange={(val, opts) => {
          console.log("onChange:", val, opts);
          setVal3(val);
        }}
        titleModal={"选择角色"}
        placeholder={"请选择角色"}
        defaultOptions={roleList}
        selectProps={{ style: { width: 360 } }}
      />
      <Descriptions size="small" column={1} style={{ marginTop: 8 }}>
        <Descriptions.Item label={"当前值"}>
          {val3.length > 0 ? JSON.stringify(val3) : "未选择"}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};
