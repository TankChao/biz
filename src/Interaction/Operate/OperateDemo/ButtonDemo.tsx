/**
 * Operate Demo - Button 触发器
 */
import React, { useEffect } from "react";
import { Table, Button, Space, Tag } from "antd";
import { setOperateConfig } from "@kachina/biz";
import type { ContentProps } from "@kachina/biz";

const mockData = [
  { id: "1", name: "张三", dept: "技术部", status: "active" },
  { id: "2", name: "李四", dept: "产品部", status: "inactive" },
  { id: "3", name: "王五", dept: "设计部", status: "active" },
];

const DetailContent = ({ params, closeModal, setFooter, disabled }: ContentProps) => {
  useEffect(() => {
    setFooter(
      <Space>
        <Button onClick={closeModal}>取消</Button>
        <Button type="primary" onClick={() => { console.log("确认", params); closeModal(); }}>确认</Button>
      </Space>,
    );
  }, [params, closeModal, setFooter]);

  return (
    <div>
      <p>姓名：{params?.name}</p>
      <p>部门：{params?.dept}</p>
      <p>状态：{params?.status}</p>
      <p>禁用态：{disabled ? "是" : "否"}</p>
    </div>
  );
};

const DetailContent1 = ({ params, closeModal, setFooter, disabled }: ContentProps) => {
  useEffect(() => {
    setFooter(
      <Space>
        <Button onClick={closeModal}>取消</Button>
        <Button type="primary" onClick={() => { console.log("确认", params); closeModal(); }}>确认</Button>
      </Space>,
    );
  }, [params, closeModal, setFooter]);

  return (
    <div>
      <p>姓名111：{params?.name}</p>
      <p>部门111：{params?.dept}</p>
      <p>状态111：{params?.status}</p>
      <p>禁用态111：{disabled ? "是" : "否"}</p>
    </div>
  );
};

const MyOperate = setOperateConfig({
  content: DetailContent,
  fieldNames: { label: "name", value: "id" },
});

const MyOperate1 = setOperateConfig({
  content: DetailContent1,
  fieldNames: { label: "name", value: "id" },
});

export default () => {
  return (
    <MyOperate.Parent titleModal="员工详情">
      <Table
        dataSource={mockData}
        rowKey="id"
        columns={[
          { title: "姓名", dataIndex: "name" },
          { title: "部门", dataIndex: "dept" },
          {
            title: "状态",
            dataIndex: "status",
            render: (s: string) => (
              <Tag color={s === "active" ? "green" : "red"}>
                {s === "active" ? "在职" : "离职"}
              </Tag>
            ),
          },
          {
            title: "操作",
            render: (_: any, record: any) => (
              <Space>
                <MyOperate.Item
                  params={record}
                  titleModal={record.name + " 的详情"}
                >
                  查看详情
                </MyOperate.Item>
                <MyOperate1.Item
                  params={record}
                  titleModal={record.name + " 的详情"}
                >
                  查看详情111
                </MyOperate1.Item>
              </Space>
            ),
          },
        ]}
      />
    </MyOperate.Parent>
  );
};
