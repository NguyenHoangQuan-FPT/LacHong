import "../../assets/styles/About.css";

export default function About() {
    return (
        <section className="about-page">
            <div className="about-container">

                <div className="about-hero">
                    <div>
                        <h1 className="about-title">Câu chuyện Lạc Hồng</h1>

                        <p className="about-text">
                            Lạc Hồng là sàn thương mại điện tử chuyên biệt về đồ gốm và sản phẩm thủ công mỹ nghệ truyền thống Việt Nam, được xây dựng với sứ mệnh kết nối nghệ nhân với cộng đồng yêu giá trị thủ công trong và ngoài nước.
                        </p>

                        <p className="about-text">
                            Chúng tôi tạo ra một không gian số nơi các nghệ nhân, làng nghề và xưởng thủ công có thể trực tiếp tham gia, đăng tải và kinh doanh sản phẩm của mình một cách minh bạch, thuận tiện và bền vững. Mỗi sản phẩm trên Lạc Hồng không chỉ là một món hàng, mà còn là câu chuyện về văn hóa, bàn tay và tâm hồn của người làm nghề.
                        </p>

                        <p className="about-text">Bên cạnh chức năng mua bán, Lạc Hồng còn phát triển diễn đàn cộng đồng, nơi các nghệ nhân, người yêu thủ công và khách hàng có thể:</p>

                        <ul className="about-list">
                            <li>Chia sẻ câu chuyện làng nghề</li>
                            <li>Đăng bài giao lưu, trao đổi kinh nghiệm</li>
                            <li>Thảo luận về kỹ thuật, chất liệu và xu hướng thủ công mỹ nghệ</li>
                            <li>Gìn giữ và lan tỏa giá trị văn hóa truyền thống</li>
                        </ul>

                        <p className="about-text">
                            Với định hướng phát triển bền vững, Lạc Hồng mong muốn trở thành cầu nối giữa truyền thống và hiện đại, góp phần bảo tồn làng nghề, nâng cao giá trị sản phẩm thủ công Việt Nam và đưa tinh hoa văn hóa Việt vươn xa.
                        </p>
                    </div>

                    <div className="about-media">
                        <img
                            className="about-media__img"
                            src="/images/Banner/Login.jpg"
                            alt="Lạc Hồng – đồ gốm và thủ công mỹ nghệ"
                            loading="lazy"
                        />
                    </div>
                </div>

                <div className="about-sections">
                    <section className="about-section" aria-label="Sứ mệnh">
                        <h2 className="about-section-title">Sứ mệnh</h2>
                        <p className="about-section-text">
                            Lạc Hồng mang sứ mệnh kết nối và nâng tầm giá trị thủ công mỹ nghệ Việt Nam thông qua nền tảng thương mại điện tử hiện đại, minh bạch và bền vững.
                        </p>
                        <p className="about-section-text">
                            Chúng tôi hướng đến việc trao quyền cho nghệ nhân và làng nghề truyền thống, giúp họ tiếp cận thị trường rộng lớn hơn, kể câu chuyện nghề một cách trọn vẹn và tạo ra giá trị kinh tế song hành cùng giá trị văn hóa.
                        </p>
                    </section>

                    <section className="about-section" aria-label="Tầm nhìn">
                        <h2 className="about-section-title">Tầm nhìn</h2>
                        <p className="about-section-text">
                            Lạc Hồng hướng tới trở thành sàn thương mại điện tử hàng đầu về thủ công mỹ nghệ Việt Nam, là điểm đến tin cậy cho cộng đồng yêu văn hóa thủ công trong và ngoài nước.
                        </p>
                        <p className="about-section-text">
                            Chúng tôi mong muốn xây dựng một hệ sinh thái số cho làng nghề, nơi truyền thống được bảo tồn, sáng tạo được khuyến khích và giá trị văn hóa Việt được lan tỏa bền vững trên thị trường toàn cầu.
                        </p>
                    </section>

                    <section className="about-section" aria-label="Chính sách">
                        <h2 className="about-section-title">Chính sách</h2>

                        <ol className="about-policy">
                            <li className="about-policy-item">
                                <h3 className="about-policy-title">Chính sách tham gia sàn</h3>
                                <p className="about-section-text">
                                    Lạc Hồng là nền tảng mở dành cho nghệ nhân, làng nghề, cơ sở sản xuất và kinh doanh thủ công mỹ nghệ truyền thống Việt Nam.
                                </p>
                                <p className="about-section-text">
                                    Các đơn vị tham gia sàn cần cung cấp thông tin trung thực, đầy đủ và hợp pháp, chịu trách nhiệm trước pháp luật về sản phẩm, nội dung và hoạt động kinh doanh của mình trên Lạc Hồng.
                                </p>
                                <p className="about-section-text">
                                    Lạc Hồng có quyền xét duyệt, từ chối hoặc tạm ngưng gian hàng nếu phát hiện hành vi vi phạm quy định, ảnh hưởng đến uy tín cộng đồng và giá trị văn hóa thủ công.
                                </p>
                            </li>

                            <li className="about-policy-item">
                                <h3 className="about-policy-title">Chính sách sản phẩm</h3>
                                <ul className="about-policy-list">
                                    <li>
                                        Sản phẩm đăng bán phải là đồ gốm, thủ công mỹ nghệ, đan lát và các sản phẩm liên quan đến làng nghề truyền thống.
                                    </li>
                                    <li>
                                        Thông tin sản phẩm cần mô tả rõ ràng về nguồn gốc, chất liệu, kích thước, giá bán và hình ảnh thực tế.
                                    </li>
                                    <li>
                                        Nghiêm cấm đăng tải sản phẩm giả mạo, sao chép, vi phạm bản quyền, trái pháp luật hoặc không đúng với giá trị thủ công truyền thống.
                                    </li>
                                    <li>
                                        Lạc Hồng khuyến khích các sản phẩm mang yếu tố thủ công, bền vững, thân thiện môi trường và có câu chuyện văn hóa rõ ràng.
                                    </li>
                                </ul>
                            </li>
                        </ol>
                    </section>
                </div>
            </div>
        </section>
    );
}
