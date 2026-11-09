/**
 * Operate Demo - Select 触发器（valueType = Key）
 */
import React, { useState } from "react";
import { Button, Descriptions } from "antd";
import { setOperateConfig } from "@kachina/biz";
import type { ContentProps } from "@kachina/biz";

const cityList = [
  { cityCode: "BJ", cityName: "北京", region: "华北" },
  { cityCode: "SH", cityName: "上海", region: "华东" },
  { cityCode: "GZ", cityName: "广州", region: "华南" },
  { cityCode: "SZ", cityName: "深圳", region: "华南" },
  { cityCode: "HZ", cityName: "杭州", region: "华东" },
];

const CitySelectContent = ({ onChange, closeModal }: ContentProps) => {
  const [selected, setSelected] = useState<string | undefined>();

  const handleConfirm = () => {
    const item = cityList.find((c) => c.cityCode === selected);
    onChange(selected, item ? [item] : []);
    closeModal();
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>请选择城市：</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {cityList.map((city) => (
          <label key={city.cityCode} style={{ cursor: "pointer" }}>
            <input
              type="radio"
              checked={selected === city.cityCode}
              onChange={() => setSelected(city.cityCode)}
            />
            <span style={{ marginLeft: 8 }}>
              {city.cityName}（{city.region}）
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

const CityOperate = setOperateConfig({
  content: CitySelectContent,
  fieldNames: { label: "cityName", value: "cityCode" },
  touchType: "select",
  valueType: "Key",
});

export default () => {
  const [value, setValue] = useState<string | undefined>();

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <CityOperate
          value={value}
          onChange={(val, opts) => {
            console.log("onChange:", val, opts);
            setValue(val);
          }}
          titleModal="选择城市"
          placeholder="请选择城市"
          defaultOptions={cityList}
          selectProps={{ style: { width: 240 } }}
        />
      </div>
      <Descriptions title="当前值" bordered size="small" column={1}>
        <Descriptions.Item label="value（Key 类型）">
          {value ?? "未选择"}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};
