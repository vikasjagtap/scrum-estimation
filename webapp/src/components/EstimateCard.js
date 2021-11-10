import React from "react";
// import logo from './logo.svg';
import './EstimateCard.scss';

class EstimateCard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            faceUp: false
        };
    }
    render() {
        return ( <div className="estimate" onClick={() => this.handleClick()}>
            <div className="estimateValue"><span>{this.props.value}</span></div>
            {/*<img src={logo} className="cardImage bottom" alt="logo" />*/}
        </div>);
    }

    handleClick() {
        this.props.onClick(this.props.value);
    }
}

export default EstimateCard;