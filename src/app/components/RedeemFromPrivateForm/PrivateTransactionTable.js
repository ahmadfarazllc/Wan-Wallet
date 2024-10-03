import React, { Component } from 'react';
import { Table } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import style from './index.less';
@inject(stores => ({
    language: stores.languageIntl.language,
}))

@observer
class PrivateTransactionTable extends Component {
    columns = () => [
        {
            title: intl.get('RedeemFromPrivateForm.PrivateAddress'),
            dataIndex: 'toPrivateAddr',
            className: style.privateAddrColumn,
        },
        {
            title: intl.get('Common.amount'),
            dataIndex: 'value',
            width: 140
        }
    ];

    rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            this.props.handleCheck(selectedRows);
        }
    };

    render() {
        return (
            <div className={style.selectPrivateTransactionTable} style={{ marginBottom: '24px' }}>
                <Table rowSelection={this.rowSelection} columns={this.columns()} dataSource={this.props.balanceData} rowKey={record => record.toPrivateAddr} pagination={false} />
            </div>
        );
    }
}

export default PrivateTransactionTable;
