/**
 * Operate Demo - 多选模式
 */
import React, { useState } from "react";
import { Button, Descriptions, Divider } from "antd";
import { setOperateConfig } from "@kachina/biz";
import type { ContentProps } from "@kachina/biz";

const productList = [
  { sku: "P001", productName: "笔记本电脑", category: "电子产品" },
  { sku: "P002", productName: "机械键盘", category: "外设" },
  { sku: "P003", productName: "显示器", category: "电子产品" },
  { sku: "P004", productName: "鼠标", category: "外设" },
  { sku: "P005", productName: "耳机", category: "音频" },
];

const ProductSelectContent = ({ onChange, closeModal }: ContentProps) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleConfirm = () => {
    const items = productList.filter((p) => selected.includes(p.sku));
    onChange(selected, items);
    closeModal();
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>请选择产品（可多选）：</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {productList.map((product) => (
          <label key={product.sku} style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={selected.includes(product.sku)}
              onChange={() => {
                setSelected((prev) =>
                  prev.includes(product.sku)
                    ? prev.filter((id) => id !== product.sku)
                    : [...prev, product.sku],
                );
              }}
            />
            <span style={{ marginLeft: 8 }}>
              {product.productName}（{product.category}）
            </span>
          </label>
        ))}
      </div>
      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Button onClick={closeModal} style={{ marginRight: 8 }}>取消</Button>
        <Button type="primary" onClick={handleConfirm}>
          确认（已选 {selected.length} 项）
        </Button>
      </div>
    </div>
  );
};

const ProductOperate = setOperateConfig({
  content: ProductSelectContent,
  fieldNames: { label: "productName", value: "sku" },
  touchType: "select",
  valueType: "Key[]",
  multiple: true,
});

export default () => {
  const [valueKey, setValueKey] = useState<string[]>([]);

  return (
    <div>
      <h4>多选模式（valueType = Key[]）</h4>
      <div style={{ marginBottom: 16 }}>
        <ProductOperate
          value={valueKey}
          onChange={(val, opts) => {
            console.log("onChange Key[]:", val, opts);
            setValueKey(val);
          }}
          titleModal="选择产品"
          placeholder="请选择产品"
          defaultOptions={productList}
          selectProps={{ style: { width: 360 } }}
        />
      </div>
      <Descriptions title="当前值" bordered size="small" column={1}>
        <Descriptions.Item label="value（Key[] 类型）">
          {valueKey.length > 0 ? JSON.stringify(valueKey) : "未选择"}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <p style={{ color: "#999" }}>
        提示：多选模式下，可通过 Select 标签上的关闭按钮移除已选项，
        也可点击 Select 重新打开弹窗修改选择。
      </p>
    </div>
  );
};
