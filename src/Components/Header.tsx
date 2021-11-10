const Header = () => {
  return (
    <header>
      <h1>
        <span className="suit-red">&hearts;</span>
        <span className="suit-black">&spades;</span>Blackjack{" "}
        <span className="suit-black">&clubs;</span>
        <span className="suit-red">&diams;</span>
      </h1>
      <div id="header-info">
        <h2>Blackjack pays 3:2</h2>
        <h3>Dealer must draw to 16, and stand on all 17's</h3>
      </div>
    </header>
  );
};

export default Header;
