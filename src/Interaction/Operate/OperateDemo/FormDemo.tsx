/**
 * Operate Demo - Form 表单集成
 */
import React from "react";
import { Form, Button, Input, Descriptions } from "antd";
import { setOperateConfig } from "@kachina/biz";
import type { ContentProps } from "@kachina/biz";

const roleList = [
  { roleId: "R01", roleName: "管理员", roleDesc: "拥有所有权限" },
  { roleId: "R02", roleName: "编辑者", roleDesc: "可编辑内容" },
  { roleId: "R03", roleName: "查看者", roleDesc: "仅可查看" },
];

const RoleSelectContent = ({ onChange, closeModal }: ContentProps) => {
  const [selected, setSelected] = React.useState<string | undefined>();

  const handleConfirm = () => {
    const item = roleList.find((r) => r.roleId === selected);
    onChange(selected, item ? [item] : []);
    closeModal();
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>请选择角色：</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {roleList.map((role) => (
          <label key={role.roleId} style={{ cursor: "pointer" }}>
            <input
              type="radio"
              checked={selected === role.roleId}
              onChange={() => setSelected(role.roleId)}
            />
            <span style={{ marginLeft: 8 }}>
              {role.roleName} - {role.roleDesc}
            </span>
          </label>
        ))}
      </div>
      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Button onClick={closeModal} style={{ marginRight: 8 }}>取消</Button>
        <Button type="primary" onClick={handleConfirm}>确认</Button>
      </div>
    </div>
  );
};

const RoleOperate = setOperateConfig({
  content: RoleSelectContent,
  fieldNames: { label: "roleName", value: "roleId" },
  touchType: "select",
  valueType: "Key",
});

export default () => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    console.log("表单提交:", values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ username: "", role: undefined }}
      style={{ maxWidth: 480 }}
    >
      <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
        <Input placeholder="请输入用户名" />
      </Form.Item>

      <Form.Item name="role" label="角色" rules={[{ required: true, message: "请选择角色" }]}>
        <RoleOperate
          titleModal="选择角色"
          placeholder="请选择角色"
          defaultOptions={roleList}
          selectProps={{ style: { width: "100%" } }}
        />
      </Form.Item>


      <Form.Item>
        <Button type="primary" htmlType="submit">提交</Button>
      </Form.Item>

      <Form.Item noStyle shouldUpdate>
        {({ getFieldsValue }) => {
          const values = getFieldsValue();
          return (
            <Descriptions title="表单值" bordered size="small" column={1}>
              <Descriptions.Item label="username">
                {values.username || "未填写"}
              </Descriptions.Item>
              <Descriptions.Item label="role">
                {values.role ?? "未选择"}
              </Descriptions.Item>
            </Descriptions>
          );
        }}
      </Form.Item>
    </Form>
  );
};
