import React from "react";
import EstimateCard from "./EstimateCard";
import "./EstimateBoard.scss"
import {ReactComponent as CoffeeIcon} from "./coffee.svg";

class EstimateBoard extends React.Component {
    constructor(props) {
        super(props);
        this.cardValues = [1, 2, 3, 5, 8, 13, 21, 34];
    }

    renderCard(value, index) {
        return <EstimateCard key={index.toString()} value={value} onClick={(clickedValue) => this.handleClick(clickedValue)}/>
    }
    render() {
        return (
                <div className="EstimateBoard">
                    {this.renderCard(<CoffeeIcon />, 1)}
                    {this.cardValues.map((value, index) => this.renderCard(value, index + 2))}
                    {this.renderCard('?', this.cardValues.length + 2)}
                </div>
        );
    }

    handleClick(value) {
       this.props.onEstimateChange(value);
    }
}

export default EstimateBoard;