import { useState } from "react";

export const useInputState = (initialState,error,iconColor,inputBorderColor,name) => {
    const [isFocused, setIsFocused] = useState(initialState);
    const [isValid, setIsValid] = useState(initialState); 
  
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => {
      setIsFocused(false);
      setIsValid(!error);
    };

 
    if (error) {
        iconColor = '#CC212D';
        inputBorderColor = '#CC212D';
    } else if (isFocused) {
        iconColor = '#B593D7';
        inputBorderColor = '#B593D7';
    } else {
        if (isValid) {
            iconColor = 'black';
            inputBorderColor = '#c3c3c3';
        } else {
            iconColor = '#c3c3c3';
            inputBorderColor = '#c3c3c3';
        }
    }
  
  
    return {
    iconColor,
    inputBorderColor,
      isFocused,
      isValid,
      handleFocus,
      handleBlur,
    };
  };