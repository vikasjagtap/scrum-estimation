import React from "react";
import EstimateCard from "./EstimateCard";
import "./EstimatorBoard.scss"
import _ from "lodash";
import EstimationStatus from "./EstimationStatus";
import {ReactComponent as VotedIcon} from "./voted.svg"
import Loader from "react-loader-spinner";

class EstimatorBoard extends React.Component {
    constructor(props) {
        super(props);
    }

    renderEstimatorCard(estimator, index) {
        let vote = _.find(this.props.votes, {name: estimator.name});
        let value;
        switch (this.props.status) {
            case EstimationStatus.FINISHED:
                value = vote ? vote : '?';
                break;
            case EstimationStatus.STARTED:
                value = vote ? <VotedIcon/> : <Loader className="sessionLoading light" type="ThreeDots" color="#2BAD60" height="75" width="75"/>;
                break
            default:
                value="";
        }

        return <div key={index.toString()} className={"estimator"}>
            <div>{estimator.name}</div>
            <EstimateCard value={value}/>
        </div>
    }
    render() {
        console.log(this.props);
        if (!this.props.estimators || this.props.estimators.length === 0) {
            return <div className="EstimatorBoard">
                <div className="estimatorBoardHeader">No Estimators</div>
            </div>
        }
        return (
                <div className="EstimatorBoard">
                    <div className="estimatorBoardHeader">Estimators</div>
                    <div className={"estimators"}>
                        {this.props.estimators.map((value, index) => this.renderEstimatorCard(value, index))}
                    </div>
                </div>
        );
    }
}

export default EstimatorBoard;