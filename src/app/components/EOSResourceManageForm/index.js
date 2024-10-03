import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Modal, Tabs, Form, Icon, message, Spin } from 'antd';
import intl from 'react-intl-universal';
import EOSAccountRAM from './EOSAccountRAM';
import EOSAccountCPU from './EOSAccountCPU';
import EOSAccountNET from './EOSAccountNET';
import style from './index.less';
const RAM = Form.create({ name: 'EOSAccountRAM' })(EOSAccountRAM);
const CPU = Form.create({ name: 'EOSAccountCPU' })(EOSAccountCPU);
const NET = Form.create({ name: 'EOSAccountNET' })(EOSAccountNET);
const { TabPane } = Tabs;
const CHAINNAME = 'EOS';

@inject(stores => ({
    language: stores.languageIntl.language,
    settings: stores.session.settings,
    selectedAccount: stores.eosAddress.selectedAccount,
}))

@observer
class EOSResourceManageForm extends Component {
    state = {
        activeKey: 0,
        accountStakeInfo: []
    }

    componentDidMount () {
        wand.request('account_getAccountStakeInfo', { chain: CHAINNAME, account: this.props.selectedAccount.account }, (err, res) => {
            if (!err && res) {
                setTimeout(() => {
                    this.setState({
                        accountStakeInfo: res.rows
                    });
                });
            } else {
                console.log('Get account stake information failed');
                console.log('err:', err);
            }
        });
    }

    onChange = (activeKey) => {
        this.setState({
            activeKey
        })
    }

    onCancel = () => {
        this.props.onCancel();
    }

    render() {
        const { prices } = this.props;
        return (
            <Modal
                visible
                wrapClassName={style.EOSResourceManageFormModal}
                destroyOnClose={true}
                closable={false}
                title={intl.get('EOSAccountList.eosResourceManagement')}
                onCancel={this.onCancel}
                footer={null}
            >
                <Spin spinning={false} size="large" /* tip={intl.get('Loading.transData')} indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />} */ className="loadingData">
                    <Tabs className={style.tabs} defaultActiveKey={'0'} onChange={this.onChange} tabBarStyle={{ textAlign: 'center' }} tabBarGutter={150}>
                        <TabPane tab="RAM" key="0">
                            <RAM price={prices.ram ? prices.ram : 0 } onCancel={this.onCancel} />
                        </TabPane>
                        <TabPane tab="CPU" key="1">
                            <CPU accountStakeInfo={this.state.accountStakeInfo} onCancel={this.onCancel} />
                        </TabPane>
                        <TabPane tab="NET" key="2">
                            <NET accountStakeInfo={this.state.accountStakeInfo} onCancel={this.onCancel} />
                        </TabPane>
                    </Tabs>
                </Spin>
            </Modal>
        );
    }
}

export default EOSResourceManageForm;
