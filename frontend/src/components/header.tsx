interface HeaderProps {
    siteName?: string;
    pageName: string;
}

const Header: React.FC<HeaderProps> = ({siteName = "CriptoTrade", pageName}) => {
    return(
        <div className="header">
            <button className="btn"></button>
            <button className="btn"></button>
        </div>
    )
}

export default Header;
