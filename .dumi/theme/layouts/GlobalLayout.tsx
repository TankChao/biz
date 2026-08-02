import { useOutlet } from 'dumi';
import React from 'react';

const cssOverride = `
  .dumi-default-doc-layout > main {
    max-width: 100% !important;
  }
  .dumi-default-hero {
    max-width: 100% !important;
  }
  .dumi-default-features {
    max-width: 960px !important;
    margin: 0 auto !important;
    padding: 148px 24px 80px !important;
    display: flex !important;
    flex-wrap: nowrap !important;
    justify-content: center !important;
    gap: 32px !important;
  }
  .dumi-default-features-item {
    background: #fff !important;
    border-radius: 12px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
    border: 1px solid #e4e9ec !important;
    padding: 28px 24px !important;
    flex: 1 1 0 !important;
    max-width: 440px !important;
    transition: box-shadow 0.25s, transform 0.25s !important;
    float: none !important;
    margin: 0 !important;
    box-sizing: border-box !important;
  }
  .dumi-default-features-item:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12) !important;
    transform: translateY(-4px) !important;
  }
  .dumi-default-features-item > i {
    font-size: 20px !important;
    font-style: normal !important;
    display: inline !important;
    margin: 0 !important;
    vertical-align: middle !important;
    margin-right: 8px !important;
  }
  .dumi-default-features-item > h3 {
    font-size: 18px !important;
    margin: 0 0 12px !important;
    color: #1d2129 !important;
    display: inline !important;
    vertical-align: middle !important;
  }
  .dumi-default-features-item > h3 + p {
    margin-top: 12px !important;
  }
  .dumi-default-features-item > p {
    font-size: 14px !important;
    color: #4e5969 !important;
    margin: 0 !important;
    line-height: 1.7 !important;
  }
  .dumi-default-header-content {
    max-width: 100% !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-bottom: 1px solid #e4e9ec;
  }
  .dumi-default-sidebar {
    width: 390px !important;
  }
`;

const GlobalLayout: React.FC = () => {
  const outlet = useOutlet();
  return (
    <>
      <style>{cssOverride}</style>
      {outlet}
    </>
  );
};

export default GlobalLayout;
