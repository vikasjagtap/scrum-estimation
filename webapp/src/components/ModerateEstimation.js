import React from "react";
import EstimatorBoard from "./EstimatorBoard";
import EstimationDetails from "./EstimationDetails"
import "./ModerateEstimation.scss"

class ModerateEstimation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    componentDidMount() {
        this._mounted = true;
    }

    render() {

        if (!this.props.estimation) {
            return <div></div>;
        }

        return (
            <div className="ModerateEstimation">
                <EstimationDetails estimation={this.props.estimation}/>
                <EstimatorBoard estimators={this.props.estimators} votes={this.props.estimation.votes} status={this.props.estimation.status}/>
                <button onClick={() => this.props.onFinishVoting()}>Finish Voting</button>
            </div>
        );
    }
}

export default ModerateEstimation;