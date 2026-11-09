/**
 * Operate Demo - Select 触发器（valueType = Item）
 */
import React, { useState } from "react";
import { Button, Descriptions } from "antd";
import { createOperate } from "@kachina/biz";
import type { ContentProps } from "@kachina/biz";

const employeeList = [
  { empId: "E001", empName: "张三", empDept: "技术部" },
  { empId: "E002", empName: "李四", empDept: "产品部" },
  { empId: "E003", empName: "王五", empDept: "设计部" },
  { empId: "E004", empName: "赵六", empDept: "市场部" },
];

const EmployeeSelectContent = ({ onChange, closeModal, multiple }: ContentProps) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleConfirm = () => {
    const items = employeeList.filter((e) => selected.includes(e.empId));
    if (multiple) {
      onChange(items, items);
    } else {
      const item = items[0];
      onChange(item, item ? [item] : []);
    }
    closeModal();
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>请选择一名员工：</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {employeeList.map((emp) => (
          <label key={emp.empId} style={{ cursor: "pointer" }}>
            <input
              type="radio"
              checked={selected.includes(emp.empId)}
              onChange={() => setSelected([emp.empId])}
            />
            <span style={{ marginLeft: 8 }}>
              {emp.empName} - {emp.empDept}
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

const EmployeeOperate = createOperate({
  content: EmployeeSelectContent,
  fieldNames: { label: "empName", value: "empId" },
  touchType: "select",
  valueType: "Item",
});

export default () => {
  const [value, setValue] = useState<any>(undefined);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <EmployeeOperate
          value={value}
          onChange={(val, opts) => {
            console.log("onChange:", val, opts);
            setValue(val);
          }}
          titleModal="选择员工"
          placeholder="请选择员工"
          selectProps={{ style: { width: 240 } }}
        />
      </div>
      <Descriptions title="当前值" bordered size="small" column={1}>
        <Descriptions.Item label="value（Item 类型）">
          {value ? JSON.stringify(value) : "未选择"}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};
