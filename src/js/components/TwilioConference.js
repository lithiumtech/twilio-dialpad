import './TwilioConference.css';
import 'react-phone-number-input/style.css';

import React from 'react';
import { Form } from 'semantic-ui-react';
import { Device } from 'twilio-client';
import PhoneInput from 'react-phone-number-input';
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async/dynamic';

import Button from '@spredfast/button';
import SVGRefIcon from '@spredfast/svg-ref-icon';
import SOUND_ON from '@spredfast/ui-icons/sound-on.svg';
import SOUND_OFF from '@spredfast/ui-icons/sound-off.svg';
import PLAY_CIRCLE_THICK from '@spredfast/ui-icons/play-circle-thick.svg';
import PAUSE_CIRCLE_THICK from '@spredfast/ui-icons/pause-circle-thick.svg';
import MOBILE_PHONE from '@spredfast/ui-icons/mobile-phone.svg';
import STOP_CIRCLE_THICK from '@spredfast/ui-icons/stop-circle-thick.svg';

import { setAgentState, postInternalNote, getCaseDetails, getConversation, unassignCase } from '../api/care';
import {
    returnUserToCall,
    putUserOnHold,
    addNumberToCall,
    getToken,
    checkConferenceStatus,
    endConference,
} from '../api/twilio';
import { handBackCall } from '../api/flowai';

let COMPANY = 'flowai';

const bgColors = {
    emperor: '#525252',
    mercury: '#e5e5e5',
    snow: '#ffffff',
    shark: '#444444',
};

class TwilioConference extends React.Component {
    state = {
        calling: true,
        muted: false,
        onHold: false,
        hangUpDisabled: true,
        muteDisabled: true,
        onHoldDisabled: true,
        hide: true,

        device: null,
        connection: null,

        answerText: 'Answer',
        caseId: '',
        agent: '',
        metadata: '',
        authorId: '',
        phoneTimer: 10,

        phoneNumber: '',
        conferenceName: '',
        traceId: '',

        ringInterval: null,
    };

    async componentDidMount() {
        COMPANY = window.location.host.split('.')[0];
        console.log('COMPANY', COMPANY);

        window.top.postMessage(JSON.stringify({ showResponsePanel: false }), '*');

        const { authorId, caseId } = this.props.payload;
        const conversation = await getCaseDetails(COMPANY, caseId.a);
        console.log('conversation', conversation);

        console.log('agent', window.loggedInAgent());
        const agent = window.loggedInAgent();

        const convoDetails = await getConversation(COMPANY, conversation.data[0].id);
        console.log('convo status', convoDetails.data[0].status);
        if (
            convoDetails.data[0].status === 'INPROGRESS' &&
            agent.email === convoDetails.data[0].assignedToAgent.email
        ) {
            this.setState({ hide: false });
        } else {
            return;
        }

        let metadata = {};
        conversation.data[0].documents.some((doc) => {
            console.log('Post Content', doc.text);
            if (doc.text === 'Handover') {
                doc.lakeProperties.forEach((element, index) => {
                    console.log(`adding lake property index(${index}) [${element.key}] = ${element.value}`);
                    metadata[element.key] = element.value;
                });
                return true;
            }
        });

        this.setState({ caseId: caseId.a, agent, metadata, authorId: authorId.a });

        const formatedAgentId = agent.email.split('@')[0];

        const token = await getToken(formatedAgentId);
        console.log('token', token);

        const device = new Device();
        device.setup(token, {
            enableIceRestart: true,
            closeProtection: 'A call is currently in progress. Leaving or reloading this page will end the call.',
            debug: true,
        });

        device.on('incoming', (connection) => {
            console.log('incoming');
        });

        device.on('ready', async (device) => {
            console.log('Device ready event');

            let status = await checkConferenceStatus(metadata.conferenceId);
            console.log('before if');
            if (status.status === 'in-progress') {
                // const ringInterval = setIntervalAsync(async () => {
                //     console.log('setIntervalAsync');
                //     if (this.state.phoneTimer % 2 == 0) {
                //         device.audio.ringtoneDevices.test();
                //     }
                //     status = await checkConferenceStatus(metadata.conferenceId);
                //     if (status.status !== 'in-progress') {
                //         console.log('call not in progress');
                //         clearIntervalAsync(this.state.ringInterval);
                //         this.setState({
                //             calling: false,
                //             ringInterval: null,
                //             answerText: 'Answer',
                //             phoneTimer: 10,
                //         });
                //         console.log('set state', {
                //             calling: false,
                //             ringInterval: null,
                //             answerText: 'Answer',
                //             phoneTimer: 10,
                //         });
                //     } else if (this.state.phoneTimer < 1) {
                //         console.log('phoneTimer', this.state.phoneTimer);
                //         await setAgentState(COMPANY, agent.email, '46a31fd6-820c-4bba-9d43-4b96c971e7c9');
                //         await this.unassign();
                //         await postInternalNote(
                //             COMPANY,
                //             this.state.caseId,
                //             `Agent ${agent.name} failed to pick up call`
                //         );
                //         location.reload();
                //         clearIntervalAsync(this.state.ringInterval);
                //         this.setState({
                //             calling: false,
                //             ringInterval: null,
                //             answerText: 'Answer',
                //             phoneTimer: 10,
                //         });
                //     } else {
                //         console.log('reducing timer', {
                //             answerText: `${this.state.phoneTimer - 1}`,
                //             phoneTimer: this.state.phoneTimer - 1,
                //         });
                //         this.setState({
                //             answerText: `${this.state.phoneTimer - 1}`,
                //             phoneTimer: this.state.phoneTimer - 1,
                //         });
                //     }
                // }, 1000);
                // // device.audio.ringtoneDevices.test();
                // this.setState({ calling: true, ringInterval, answerText: '10', phoneTimer: 10, hide: false });
                await this.acceptCall();
                //this.setState({ calling: true });
            } else {
                console.log('hide dialpad');
                this.setState({ hide: true });
            }
        });

        device.on('connect', async (connection) => {
            console.log('connect');
        });

        device.on('disconnect', async (connection) => {
            console.log('disconnect');
            this.setState({
                hangUpDisabled: true,
                calling: false,
                muteDisabled: true,
            });
            // console.log('setAgentState', {
            //     company: COMPANY,
            //     email: agent.email,
            //     status: '909b7c05-0bb9-496a-a8e1-5d71ac603a15',
            // });
            // await setAgentState(COMPANY, agent.email, '909b7c05-0bb9-496a-a8e1-5d71ac603a15');
            await postInternalNote(COMPANY, caseId.a, 'Connection Closed');
        });

        device.on('error', (error) => {
            console.log('error', error);
        });

        this.setState({
            device: device,
        });
    }

    acceptCall = async () => {
        const device = this.state.device;
        const params = {
            agentCall: true,
            ...this.state.metadata,
        };
        console.log(params);
        const connection = device.connect(params);

        // clearIntervalAsync(this.state.ringInterval);
        window.__gwtResponseBridge.setText('Agent Answered Call');
        window.__gwtResponseBridge.getSendPostFn()();
        this.setState({
            calling: false,
            hangUpDisabled: false,
            muteDisabled: false,
            onHoldDisabled: false,
            connection,
            ringInterval: null,
        });
        console.log('in accept');
        await postInternalNote(COMPANY, this.state.caseId, 'Call Connected');

        // await setAgentState(COMPANY, this.state.agent.email, 'ba93a3b5-45e9-4081-878d-af934fbbde99');
    };

    hangUp = async () => {
        console.log('Calling HangUp', { COMPANY, state: this.state });
        await handBackCall(COMPANY, this.state.metadata);
        console.log('After hand back');
        this.state.connection.disconnect();
        this.state.device.disconnectAll();
    };

    mute = async () => {
        const connection = this.state.connection;
        const muted = !this.state.muted;
        connection.mute(muted);
        this.setState({
            muted,
        });
        await postInternalNote(COMPANY, this.state.caseId, muted ? 'Call Muted' : 'Call Unmuted');
    };

    putOnHold = async () => {
        if (this.state.onHold) {
            await returnUserToCall(this.state.metadata.conferenceId, this.state.metadata.CallSid);
            await postInternalNote(COMPANY, this.state.caseId, 'Resuming Call');
            console.log('resume call', {
                onHoldDisabled: false,
                onHold: false,
            });
            this.setState({
                onHoldDisabled: false,
                onHold: false,
            });
        } else {
            await putUserOnHold(this.state.metadata.conferenceId, this.state.metadata.CallSid);
            await postInternalNote(COMPANY, this.state.caseId, 'Putting Call on Hold');
            console.log('put call on hold', {
                onHold: true,
                onHoldDisabled: false,
            });
            this.setState({
                onHold: true,
                onHoldDisabled: false,
            });
        }
    };

    onPhonechange = (value) => {
        this.setState({
            phoneNumber: value,
        });
    };

    endCall = async () => {
        await endConference(this.state.metadata.conferenceId);
    };

    addNumber = async () => {
        await addNumberToCall(this.state.metadata.conferenceId, this.state.phoneNumber);
    };

    unassign = async () => {
        await unassignCase(COMPANY, this.state.caseId);
    };

    render() {
        if (this.state.hide) {
            return null;
        }

        let buttonClass = '';
        let buttonDisabled = true;
        if (this.state.calling) {
            console.log('in if');
            buttonClass = 'calling';
            buttonDisabled = false;
        }
        return (
            <Form>
                <h4 className="ui dividing header">
                    <span className="phone-controls-header">Phone Controls</span>
                </h4>
                <div style={{ margin: 10 }}>
                    <span style={{ marginRight: 10 }}>
                        <Button
                            background={bgColors.mercury}
                            size="lg"
                            className={`dialer-buttons phoneButton ${buttonClass}`}
                            disabled={buttonDisabled}
                            onClick={this.acceptCall}
                        >
                            <div>
                                <span className="dialer-icon-wrapper">
                                    <SVGRefIcon svgRef={MOBILE_PHONE} className="dialer-icons" />
                                </span>
                                <span className="buttonText">{this.state.answerText}</span>
                            </div>
                        </Button>
                    </span>
                    <span style={{ marginRight: 10 }}>
                        <Button
                            background={bgColors.mercury}
                            sfType="secondary"
                            size="lg"
                            disabled={this.state.hangUpDisabled}
                            onClick={this.endCall}
                            className="dialer-buttons hangupButton"
                        >
                            <div>
                                <span className="dialer-icon-wrapper">
                                    <SVGRefIcon svgRef={STOP_CIRCLE_THICK} className="dialer-icons" />
                                </span>
                                <span className="buttonText">Hang Up</span>
                            </div>
                        </Button>
                    </span>
                </div>
                <div style={{ margin: 10 }}>
                    <span style={{ marginRight: 10 }}>
                        <Button
                            background={bgColors.mercury}
                            size="lg"
                            disabled={this.state.muteDisabled}
                            onClick={this.mute}
                            className="dialer-buttons"
                        >
                            <div>
                                <span className="dialer-icon-wrapper">
                                    <SVGRefIcon
                                        svgRef={this.state.muted ? SOUND_OFF : SOUND_ON}
                                        className="dialer-icons"
                                    />
                                </span>
                                <span className="buttonText">{this.state.muted ? 'Unmute' : 'Mute'}</span>
                            </div>
                        </Button>
                    </span>
                    <span style={{ marginRight: 10 }}>
                        <Button
                            background={bgColors.mercury}
                            sfType="secondary"
                            size="lg"
                            disabled={this.state.onHoldDisabled}
                            onClick={this.putOnHold}
                            className="dialer-buttons on-hold-button"
                        >
                            <div>
                                <span className="dialer-icon-wrapper">
                                    <SVGRefIcon
                                        svgRef={this.state.onHold ? PLAY_CIRCLE_THICK : PAUSE_CIRCLE_THICK}
                                        className="dialer-icons"
                                    />
                                </span>
                                <span className="buttonText">{this.state.onHold ? 'Resume Call' : 'On Hold'}</span>
                            </div>
                        </Button>
                    </span>
                </div>
                {/* <div style={{ margin: 10 }}>
                    <span style={{ marginRight: 10 }}>
                        <Button
                            background={bgColors.mercury}
                            sfType="secondary"
                            size="lg"
                            disabled={this.state.hangUpDisabled}
                            onClick={this.endCall}
                            className="dialer-buttons endConferenceButton"
                        >
                            <div>
                                <span className="dialer-icon-wrapper">
                                    <SVGRefIcon svgRef={STOP_CIRCLE_THICK} className="dialer-icons" />
                                </span>
                                <span className="buttonText">End Conference</span>
                            </div>
                        </Button>
                    </span>
                </div> */}
                {/* <h4 class="ui dividing header">
                    <span className="phone-controls-header">External Transfer</span>
                </h4>
                <div style={{ margin: 10 }}>
                    <span style={{ marginRight: 10 }}>
                        <Button
                            size="lg"
                            className="dialer-buttons dispatcher"
                            background="mercury"
                            onClick={this.unassign}
                        >
                            <span className="buttonText">Unassign</span>
                        </Button>
                    </span>
                    <span style={{ marginRight: 10 }}>
                        <Button size="lg" className="dialer-buttons dispatcher" background="mercury">
                            <span className="buttonText">Refunds</span>
                        </Button>
                    </span>
                </div> */}
                {/* <div className="dialer-container">
                    <PhoneInput
                        placeholder="Enter phone number"
                        value={this.state.phoneNumber}
                        onChange={this.onPhonechange}
                        defaultCountry="US"
                        name="phoneNumber"
                    />
                    <Button className="Call" background="mercury" onClick={this.addNumber}>
                        <span className="buttonText">Call</span>
                    </Button>
                </div> */}
            </Form>
        );
    }
}

export default TwilioConference;
