export default function AppLogo() {
    return (
        <div className="flex items-center gap-3">
            {/* Vuexy Iconic Geometric V Logo SVG */}
            <div className="flex size-8 shrink-0 items-center justify-center">
                <svg
                    width="32"
                    height="24"
                    viewBox="0 0 32 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-primary"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0.00172773 0V7.47707C0.00172773 7.47707 -0.145285 9.83135 2.16099 11.8241L14.9358 23.9961L21.5779 23.9107L20.5126 10.7809L17.9936 7.825L10.0778 0H0.00172773Z"
                        fill="currentColor"
                    />
                    <path
                        opacity="0.25"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0.00172773 0V7.47707C0.00172773 7.47707 -0.145285 9.83135 2.16099 11.8241L14.9358 23.9961L21.5779 23.9107L20.5126 10.7809L17.9936 7.825L10.0778 0H0.00172773Z"
                        fill="white"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M31.9983 0V7.47707C31.9983 7.47707 32.1453 9.83135 29.839 11.8241L17.0642 23.9961L10.4221 23.9107L11.4874 10.7809L14.0064 7.825L21.9222 0H31.9983Z"
                        fill="currentColor"
                    />
                    <path
                        opacity="0.4"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M31.9983 0V7.47707C31.9983 7.47707 32.1453 9.83135 29.839 11.8241L17.0642 23.9961L10.4221 23.9107L11.4874 10.7809L14.0064 7.825L21.9222 0H31.9983Z"
                        fill="currentColor"
                    />
                </svg>
            </div>
            <div className="flex flex-col text-left">
                <span className="text-[1.2rem] font-bold tracking-tight text-[#444050] dark:text-[#cfcde4] leading-tight font-sans">
                    Classy Missy
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    Vuexy Admin
                </span>
            </div>
        </div>
    );
}
