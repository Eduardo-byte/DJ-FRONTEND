// File: src/components/Joyride/MyCustomTooltip.jsx
import React from 'react';

function MyCustomTooltip({
    step,
    continuous,
    index,
    isLastStep,
    backProps,
    closeProps,
    primaryProps,
    skipProps,
    tooltipProps,
}) {
    return (
        <div
            {...tooltipProps}
            className="p-4 rounded-lg shadow-lg max-w-md"
            style={{ background: 'white', color: 'black' }}
        >
            <div className="flex justify-between items-center">
                {step.title && (
                    <h1 className="text-xl font-bold m-0">{step.title}</h1>
                )}
                {/* <button {...closeProps} className="text-2xl bg-transparent border-none cursor-pointer">
                    &times;
                </button> */}
            </div>
            <p className="my-4">
                {typeof step.content === 'function' ? step.content() : step.content}
            </p>
            <div className="flex justify-between">
                <div>
                    {continuous && (
                        <button
                            {...skipProps}
                            className="mr-2 px-3 py-1 border border-white rounded cursor-pointer text-gray-900/50 hover:text-gray-900 transition-colors"
                        >
                            Skip
                        </button>
                    )}
                </div>
                <div className="flex">
                    {index > 0 && (
                        <button
                            {...backProps}
                            className="mr-2 px-3 py-1 border border-white rounded cursor-pointer text-gray-900/50 hover:text-gray-900 transition-colors"
                        >
                            Back
                        </button>

                    )}
                    {continuous && (
                        <button
                            {...primaryProps}
                            className="mr-2 px-3 py-1 bg-gradient-to-tr from-brand-light to-brand-secondary text-dark rounded cursor-pointer hover:bg-gray-800 transition-colors"
                        >
                            {isLastStep ? 'Finish' : 'Next'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MyCustomTooltip;

