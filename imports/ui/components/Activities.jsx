import React, {Component } from 'react';
import { MsgType } from './MsgType.jsx';
import { Link } from 'react-router-dom';
import Account from '../components/Account.jsx';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js'
import JSONPretty from 'react-json-pretty';
import _ from 'lodash';

const T = i18n.createComponent();

MultiSend = (props) => {
    return <div>
        <p><T>activities.single</T> <MsgType type={props.msg.type} /> <T>activities.happened</T></p>
        <p><T>activities.senders</T>
            <ul>
                {props.msg.value.inputs.map((data,i) =>{
                    return <li key={i}><Account address={data.address}/> <T>activities.sent</T> {data.coins.map((coin, j) =>{
                        return <span key={j} className="text-success">{new Coin(coin.amount, coin.denom).toString()}</span>
                    })}
                    </li>
                })}
            </ul>
            <T>activities.receivers</T>
            <ul>
                {props.msg.value.outputs.map((data,i) =>{
                    return <li key={i}><Account address={data.address}/> <T>activities.received</T> {data.coins.map((coin,j) =>{
                        return <span key={j} className="text-success">{new Coin(coin.amount, coin.denom).toString()}</span>
                    })}</li>
                })}
            </ul>
        </p>
    </div>
}

export default class Activites extends Component {
    constructor(props){
        super(props);
    }

    render(){
        // console.log(this.props);
        const msg = this.props.msg;
        const events = [];
        for (let i in this.props.events){
            events[this.props.events[i].type] = this.props.events[i].attributes
        }
        
        switch (msg.type){
        // bank
        case "dip/MsgSend":
            let amount = '';
            amount = msg.value.amount.map((coin) => new Coin(coin.amount, coin.denom).toString()).join(', ')
            return <p><Account address={msg.value.from_address} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <span className="text-success">{amount}</span> <T>activities.to</T> <span className="address"><Account address={msg.value.to_address} /></span><T>common.fullStop</T></p>
        case "dip/MsgMultiSend":
            return <MultiSend msg={msg} />

            // staking
        case "dip/MsgCreateValidator":
            return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <T>activities.operatingAt</T> <span className="address"><Account address={msg.value.validator_address}/></span> <T>activities.withMoniker</T> <Link to="#">{msg.value.description.moniker}</Link><T>common.fullStop</T></p>
        case "dip/MsgEditValidator":
            return <p><Account address={msg.value.address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /></p>
        case "dip/MsgDelegate":
            return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <span className="text-warning">{new Coin(msg.value.amount.amount, msg.value.amount.denom).toString(6)}</span> <T>activities.to</T> <Account address={msg.value.validator_address} /><T>common.fullStop</T></p>
        case "dip/MsgUndelegate":
            return <p><Account address={msg.value.delegator_address} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <span className="text-warning">{new Coin(msg.value.amount.amount, msg.value.amount.denom).toString(6)}</span> <T>activities.from</T> <Account address={msg.value.validator_address} /><T>common.fullStop</T></p>
        case "dip/MsgBeginRedelegate":
            return <p><Account address={msg.value.delegator_address} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <span className="text-warning">{new Coin(msg.value.amount.amount, msg.value.amount.denom).toString(6)}</span> <T>activities.from</T> <Account address={msg.value.validator_src_address} /> <T>activities.to</T> <Account address={msg.value.validator_dst_address} /><T>common.fullStop</T></p>

            // gov
        case "dip/MsgSubmitProposal":
            const proposalId = _.get(this.props, 'events[2].attributes[0].value', null)
            const proposalLink = proposalId ? `/proposals/${proposalId}` : "#";
            return <p><Account address={msg.value.proposer} /> <MsgType type={msg.type} /> <T>activities.withTitle</T> <Link to={proposalLink}>{msg.value.content.value.title}</Link><T>common.fullStop</T></p>
        case "dip/MsgDeposit":
            return <p><Account address={msg.value.depositor} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <em className="text-info">{msg.value.amount.map((amount,i) =>new Coin(amount.amount, amount.denom).toString(6)).join(', ')}</em> <T>activities.to</T> <Link to={"/proposals/"+msg.value.proposal_id}><T>proposals.proposal</T> {msg.value.proposal_id}</Link><T>common.fullStop</T></p>
        case "dip/MsgVote":
            return <p><Account address={msg.value.voter} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} />  <Link to={"/proposals/"+msg.value.proposal_id}><T>proposals.proposal</T> {msg.value.proposal_id}</Link> <T>activities.withA</T> <em className="text-info">{msg.value.option}</em><T>common.fullStop</T></p>

            // distribution
        case "dip/MsgWithdrawValidatorCommission":
            return <p><Account address={msg.value.validator_address} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(events['withdraw_commission'][0].value), events['withdraw_commission'][0].value.replace(/[0-9]/g, '')).toString(6)}>activities.withAmount</T>:''}common.fullStop</T></p>
        case "dip/MsgWithdrawDelegationReward":
            return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(events['withdraw_rewards'][0].value), events['withdraw_rewards'][0].value.replace(/[0-9]/g, '')).toString(6)}>activities.withAmount</T>:''} <T>activities.from</T> <Account address={msg.value.validator_address} /><T>common.fullStop</T></p>
        case "dip/MsgModifyWithdrawAddress":
            return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /></p>

            // slashing
        case "dip/MsgUnjail":
            return <p><Account address={msg.value.address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T>common.fullStop</T></p>

            // ibc
        case "dip/IBCTransferMsg":
            return <MsgType type={msg.type} />
        case "dip/IBCReceiveMsg":
            return <MsgType type={msg.type} />

            case "dip/MsgContract":
            return <p><Account address={msg.value.from} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <span className="text-success">{new Coin(msg.value.amount.amount, msg.value.amount.denom).toString(6)}</span> <T>activities.to</T> <span className="address"><Account address={msg.value.to} /> payload={msg.value.payload}</span><T>common.fullStop</T></p>

        default:
            return <div><JSONPretty id="json-pretty" data={msg.value}></JSONPretty></div>
        }
    }
}
