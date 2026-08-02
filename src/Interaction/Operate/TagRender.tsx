import React from 'react';
import { Tag } from 'antd';
import type { SelectProps } from 'antd';

type TagRenderType = NonNullable<SelectProps['tagRender']>

const TagRender: TagRenderType = (props) => {
  const { label, closable, onClose, disabled } = props;
  const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      onMouseDown={onPreventMouseDown}
      closable={disabled ? undefined : closable}
      onClose={onClose}
      style={{ marginInlineEnd: 4 }}
    >
      {label}
    </Tag>
  );
};

export default TagRender