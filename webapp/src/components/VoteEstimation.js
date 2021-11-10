import React from "react";
import EstimationStatus from "./EstimationStatus"
import EstimateBoard from "./EstimateBoard";
import EstimationDetails from "./EstimationDetails"
import "./VoteEstimation.scss"

class VoteEstimation extends React.Component {

    constructor(props) {
        super(props);

        this.state = {};
        this.socket = this.props.sessionSocket;

        this.submitEstimate = this.submitEstimate.bind(this);
        this.handleVoteEstimation = this.handleVoteEstimation.bind(this);
    }

    submitEstimate() {
        if (this.socket) {
            this.socket.emit('voteEstimation', {estimation : this.props.estimation,
                estimator: {
                    name: this.props.name
                }
            }, this.handleVoteEstimation)
        }
    }

    handleVoteEstimation(err, estimation) {
        if (!this._mounted) {
            return;
        }
        this.setState({
            vote: undefined,
            submittedVote: this.state.vote
        })
    }

    onEstimateChanged(vote) {
        if (!this._mounted || !this.props.estimation || this.props.estimation.status !== EstimationStatus.STARTED) {
            return;
        }
        this.setState({
            vote
        });
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    componentDidMount() {
        this._mounted = true;
    }

    render() {

        console.log(this.props.estimation);
        let headerLabel;
        let buttonLabel = this.state.submittedVote ? 'Change Estimate' : 'Submit Estimate';

        const status = this.props.estimation ? this.props.estimation.status : undefined;

        switch (status) {
            case EstimationStatus.STARTED:
                headerLabel = 'Select Estimate';
                break
            case EstimationStatus.FINISHED:
                headerLabel = 'Estimation Finished';
                break
            default:
                headerLabel = 'Estimation Not Started';
        }


        return (
            <div className="estimation">
                <EstimationDetails estimation={this.props.estimation}/>
                <div className="estimationHeader">{headerLabel}</div>
                <EstimateBoard onEstimateChange={(vote) => this.onEstimateChanged(vote)}/>
                {
                    this.state.vote ?
                    <div className="selectedEstimate"><span>Selected Estimate</span><span className="vote">{this.state.vote}</span></div> : undefined
                }

                {
                    this.state.submittedVote ?
                        <div className="submittedEstimate"><span>Submitted Estimate</span><span className="vote">{this.state.submittedVote}</span></div> : undefined
                }

                <button disabled={status !== EstimationStatus.STARTED || !this.state.vote} onClick={() => this.submitEstimate()}>{buttonLabel}</button>
            </div>
        )
    }
}

export default VoteEstimation;