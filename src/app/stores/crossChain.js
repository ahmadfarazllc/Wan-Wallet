import { observable, action, computed, toJS } from 'mobx';

import tokens from './tokens';
import session from './session';
import wanAddress from './wanAddress';
import ethAddress from './ethAddress';
import btcAddress from './btcAddress';
import eosAddress from './eosAddress';
import { getInfoByAddress, getInfoByPath } from 'utils/helper';
import { timeFormat, fromWei, formatNum, formatNumByDecimals, isSameString } from 'utils/support';

class CrossChain {
  @observable currSymbol = '';

  @observable crossTrans = [];

  @action setCurrSymbol(symbol) {
    self.currSymbol = symbol;
  }

  @action updateCrossTrans() {
    wand.request('crossChain_getAllCrossTrans', null, (err, ret) => {
      if (err) {
        console.log('crossChain_getAllCrossTrans:', err);
      } else {
        self.crossTrans = ret;
      }
    })
  }

  @computed get crossChainTokensInfo () {
    return tokens.ccTokens;
  }

  @computed get crossChainOnSideBar() {
    let list = [];
    tokens.ccTokensSiderbar.forEach(item => {
      if (item.select) {
        list.push(item);
      }
    });
    return list;
  }

  @computed get crossETHTrans () {
    let crossEthTrans = [];
    self.crossTrans.forEach((item, index) => {
      if (item.tokenStand === 'ETH') {
        let fromAddrInfo = item.srcChainAddr === 'WAN' ? wanAddress.addrInfo : ethAddress.addrInfo;
        let toAddrInfo = item.srcChainAddr === 'WAN' ? ethAddress.addrInfo : wanAddress.addrInfo;
        crossEthTrans.push({
          key: index,
          hashX: item.hashX,
          storeman: item.storeman,
          secret: item.x,
          time: timeFormat(item.sendTime),
          from: (getInfoByAddress(item.fromAddr, ['name'], fromAddrInfo)).name,
          fromAddr: item.fromAddr,
          to: (getInfoByAddress(item.toAddr, ['name'], toAddrInfo)).name,
          toAddr: item.toAddr,
          value: formatNum(fromWei(item.contractValue)),
          status: item.status,
          sendTime: item.sendTime,
          srcChainAddr: item.srcChainAddr,
          dstChainAddr: item.dstChainAddr,
          lockTxHash: item.lockTxHash,
          redeemTxHash: item.redeemTxHash || 'NULL',
          revokeTxHash: item.revokeTxHash || 'NULL'
        });
      }
    });
    return crossEthTrans.sort((a, b) => b.sendTime - a.sendTime);
  }

  @computed get crossErc20Trans () {
    let crossEthTrans = [];
    let currTokenInfo = Object.values(tokens.formatTokensList).find(item => isSameString(item.symbol, self.currSymbol))
    self.crossTrans.forEach((item, index) => {
      if (isSameString(item.tokenSymbol, self.currSymbol) && (item.lockTxHash !== '')) {
        let fromAddrInfo = item.srcChainAddr === 'WAN' ? wanAddress.addrInfo : ethAddress.addrInfo;
        let toAddrInfo = item.srcChainAddr === 'WAN' ? ethAddress.addrInfo : wanAddress.addrInfo;
        crossEthTrans.push({
          key: index,
          hashX: item.hashX,
          storeman: item.storeman,
          secret: item.x,
          time: timeFormat(item.sendTime),
          from: (getInfoByAddress(item.fromAddr, ['name'], fromAddrInfo)).name,
          fromAddr: item.fromAddr,
          to: (getInfoByAddress(item.toAddr, ['name'], toAddrInfo)).name,
          toAddr: item.toAddr,
          value: formatNum(formatNumByDecimals(Number(item.contractValue), currTokenInfo.decimals)),
          status: item.status,
          sendTime: item.sendTime,
          srcChainAddr: item.srcChainAddr,
          dstChainAddr: item.dstChainAddr,
          approveTxHash: item.approveTxHash,
          lockTxHash: item.lockTxHash,
          redeemTxHash: item.redeemTxHash || 'NULL',
          revokeTxHash: item.revokeTxHash || 'NULL',
          srcChainType: item.srcChainType,
          dstChainType: item.dstChainType,
          tokenStand: item.tokenStand
        });
      }
    });
    return crossEthTrans.sort((a, b) => b.sendTime - a.sendTime);
  }

  @computed get crossBTCTrans () {
    let crossBTCTrans = [];
    Object.values(btcAddress.transHistory).filter(val => val.crossAddress !== undefined).forEach((item, index) => {
      let inbound = item.chain === 'BTC';
      let fromAddrInfo = inbound ? btcAddress.addrInfo : wanAddress.addrInfo;
      let toAddrInfo = inbound ? wanAddress.addrInfo : btcAddress.addrInfo;
      let redeemTxHash = inbound ? `0x${item.refundTxHash}` : item.btcRefundTxHash;
      let revokeTxHash = inbound ? item.btcRevokeTxHash : `0x${item.revokeTxHash}`;

      let fromInfo = getInfoByPath(item.from, fromAddrInfo);
      let toInfo = getInfoByPath(inbound ? item.wanAddress : item.btcCrossAddr, toAddrInfo);
      crossBTCTrans.push({
        key: index,
        hashX: item.hashX,
        storeman: inbound ? wand.btcUtil.hash160ToAddress(item.storeman, 'pubkeyhash', session.chainId === 1 ? 'mainnet' : 'testnet') : item.storeman,
        secret: item.x,
        time: timeFormat(item.time),
        from: fromInfo.name,
        fromAddr: fromInfo.address,
        to: toInfo.name,
        toAddr: toInfo.address,
        value: formatNum(formatNumByDecimals(item.value, 8)),
        status: item.status,
        sendTime: item.time,
        srcChainAddr: item.chain,
        dstChainAddr: item.chain === 'BTC' ? 'WAN' : 'BTC',
        lockTxHash: inbound ? item.btcLockTxHash : `0x${item.lockTxHash}`,
        redeemTxHash: redeemTxHash || 'NULL',
        revokeTxHash: revokeTxHash || 'NULL',
        noticeTxHash: `0x${item.btcNoticeTxhash}` || 'NULL'
      });
    });
    return crossBTCTrans.sort((a, b) => b.sendTime - a.sendTime);
  }

  @computed get crossEOSTrans () {
    let crossEOSTrans = [];
    let currTokenInfo = Object.values(tokens.formatTokensList).find(item => isSameString(item.symbol, self.currSymbol))
    self.crossTrans.forEach((item, index) => {
      if (isSameString(item.tokenSymbol, self.currSymbol) && (item.lockTxHash !== '')) {
        crossEOSTrans.push({
          key: index,
          hashX: item.hashX,
          storeman: item.storeman,
          secret: item.x,
          time: timeFormat(item.sendTime),
          from: item.srcChainAddr === 'WAN' ? (getInfoByAddress(item.fromAddr, ['name'], wanAddress.addrInfo)).name : item.fromAddr,
          fromAddr: item.fromAddr,
          to: item.srcChainAddr === 'WAN' ? item.toAddr : (getInfoByAddress(item.toAddr, ['name'], wanAddress.addrInfo)).name,
          toAddr: item.toAddr,
          value: formatNum(formatNumByDecimals(item.contractValue, currTokenInfo.decimals)),
          status: item.status,
          sendTime: item.sendTime,
          approveTxHash: item.approveTxHash,
          srcChainType: item.srcChainType,
          dstChainType: item.dstChainType,
          lockTxHash: item.lockTxHash,
          redeemTxHash: item.redeemTxHash || 'NULL',
          revokeTxHash: item.revokeTxHash || 'NULL',
          tokenStand: item.tokenStand
        });
      }
    });
    return crossEOSTrans.sort((a, b) => b.sendTime - a.sendTime);
  }
}

const self = new CrossChain();
export default self;
