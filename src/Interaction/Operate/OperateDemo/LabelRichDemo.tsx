/**
 * Operate Demo - fieldNames.labelRich 自定义 label 渲染
 */
import React, { useState } from "react";
import { Tag, Descriptions, Button } from "antd";
import { createOperate } from "@kachina/biz";
import type { ContentProps } from "@kachina/biz";

const accountList = [
  { acctNo: "A001", acctName: "张三", acctType: "储蓄", bankName: "工商银行" },
  { acctNo: "A002", acctName: "李四", acctType: "信用", bankName: "建设银行" },
  { acctNo: "A003", acctName: "王五", acctType: "储蓄", bankName: "农业银行" },
];

const AccountSelectContent = ({ onChange, closeModal }: ContentProps) => {
  const [selected, setSelected] = useState<string | undefined>();

  const handleConfirm = () => {
    const item = accountList.find((a) => a.acctNo === selected);
    onChange(item, item ? [item] : []);
    closeModal();
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>请选择账户：</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {accountList.map((acct) => (
          <label key={acct.acctNo} style={{ cursor: "pointer" }}>
            <input
              type="radio"
              checked={selected === acct.acctNo}
              onChange={() => setSelected(acct.acctNo)}
            />
            <span style={{ marginLeft: 8 }}>
              {acct.acctName} - {acct.bankName}（{acct.acctType}）
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

const AccountOperate = createOperate({
  content: AccountSelectContent,
  fieldNames: {
    label: "acctName",
    value: "acctNo",
    labelRich: (item: any) => (
      <span>
        <Tag color="blue">{item.acctName}</Tag>
        <span style={{ color: "#666" }}>
          {item.bankName} · {item.acctType}
        </span>
      </span>
    ),
  },
  touchType: "select",
  valueType: "Item",
});

export default () => {
  const [value, setValue] = useState<any>(undefined);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <AccountOperate
          value={value}
          onChange={(val, opts) => {
            console.log("onChange:", val, opts);
            setValue(val);
          }}
          titleModal="选择账户"
          placeholder="请选择账户"
          selectProps={{ style: { width: 320 } }}
        />
      </div>
      <Descriptions title="当前值" bordered size="small" column={1}>
        <Descriptions.Item label="value（Item 类型）">
          {value ? JSON.stringify(value) : "未选择"}
        </Descriptions.Item>
      </Descriptions>
      <p style={{ color: "#999", marginTop: 8 }}>
        提示：Select 中的 label 通过 fieldNames.labelRich 自定义渲染，
        组合了 acctName + bankName + acctType 三个字段。
      </p>
    </div>
  );
};
