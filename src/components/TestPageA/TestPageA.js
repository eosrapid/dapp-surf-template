import React, {useState} from 'react';
import {testPageA} from './TestPageA.module.scss'

import { Layout, Menu, Breadcrumb } from 'antd';
import { UserOutlined, LaptopOutlined } from '@ant-design/icons';
import { Link } from 'preact-router';
import surfboard from '@/assets/images/surfboard.svg';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

const DappSurfMainContent = ()=>(
  <div className="dappSurfMain">
    <div className="imgCon">
        <img src={surfboard} width="300" alt="Surfboard" />
    </div>
    <div className="textCon">
      dApp Surf Rules!
    </div>
  </div>
);
const MenuData = [
  {
    key: "sub1",
    label: "SubNav 1",
    icon: <UserOutlined />,
    items: [
      {key: "sub1.a", label: "Option A", content: DappSurfMainContent},
      {key: "sub1.b", label: "Option B", content: "Option B Content"},
      {key: "sub1.c", label: "Option C", content: "Option C Content"},
      {key: "sub1.d", label: "Option D", content: "Option D Content"},
      {key: "sub1.e", label: "Option E", content: "Option E Content"},
    ]
  },
  {
    key: "sub2",
    label: "SubNav 2",
    icon: <LaptopOutlined />,
    items: [
      {key: "sub2.a", label: "Option 2.A", content: "Option 2.A Content"},
      {key: "sub2.b", label: "Option 2.B", content: "Option 2.B Content"},
      {key: "sub2.c", label: "Option 2.C", content: "Option 2.C Content"},
      {key: "sub2.d", label: "Option 2.D", content: "Option 2.D Content"},
      {key: "sub2.e", label: "Option 2.E", content: "Option 2.E Content"},
    ]
  },
];
const menuKeyToObj = {};
Object.keys(MenuData).forEach(k=>MenuData[k].items.forEach(mdi=>menuKeyToObj[mdi.key]=mdi));

const TestPageA = ()=>{
  const [selectedKey, setSelectedKey] = useState('sub1.a');
  const MainContent = menuKeyToObj[selectedKey].content;

  return (
    <Layout className={testPageA}>
      <Header className="header">
        <div className="logo">
          Examplezw
        </div>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
          <Menu.Item key="1"><Link href="/">Home</Link></Menu.Item>
          <Menu.Item key="2"><Link href="/info">Example Route 1</Link></Menu.Item>
        </Menu>
      </Header>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            defaultOpenKeys={['sub1']}
            selectedKeys={[selectedKey]}
            style={{ height: '100%', borderRight: 0 }}
          >
            {MenuData.map(md=>(
              <SubMenu key={md.key} icon={md.icon} title={md.label}>
                {md.items.map(mdi=>(
                  <Menu.Item key={mdi.key} onClick={()=>setSelectedKey(mdi.key)}>{mdi.label}</Menu.Item>
                ))}
              </SubMenu>
            ))}
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>Example Page</Breadcrumb.Item>
          </Breadcrumb>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            {typeof MainContent==='function'?<MainContent />:MainContent}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default TestPageA;