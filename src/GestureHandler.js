import React from 'react';

import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler } from 'react-native-gesture-handler';

export default class GestureHandler extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { onPanStateChange, onPanEvent, onPinchEvent, children, ...props } = this.props;

        return (
            <GestureHandlerRootView
                {...props}
            >
                <PanGestureHandler
                    onHandlerStateChange={onPanStateChange}
                    onGestureEvent={onPanEvent}
                >
                    <PinchGestureHandler
                        onGestureEvent={onPinchEvent}
                    >
                        {children}
                    </PinchGestureHandler>
                </PanGestureHandler>
            </GestureHandlerRootView>
        );
    }
}
