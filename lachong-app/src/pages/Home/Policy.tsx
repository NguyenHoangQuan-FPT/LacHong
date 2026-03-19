import "../../assets/styles/Policy.css";

export default function Policy() {
    return (
        <div className="policy-page">
            <h1 className="policy-title">Chính sách &amp; Điều khoản</h1>

            <section className="policy-section" aria-label="Chính sách bảo mật thông tin cá nhân">
                <h2 className="policy-section-title">Chính sách bảo mật thông tin cá nhân</h2>
                <p className="policy-text">
                    Website thương mại điện tử cam kết bảo mật tuyệt đối thông tin cá nhân của người dùng theo quy định của pháp luật Việt Nam, đặc biệt là Nghị định 52/2013/NĐ-CP về thương mại điện tử. Các thông tin cá nhân được thu thập bao gồm họ tên, email, số điện thoại, địa chỉ và thông tin liên quan đến giao dịch, nhằm phục vụ việc đăng ký tài khoản, xử lý đơn hàng, thanh toán, cung cấp dịch vụ và hỗ trợ khách hàng.
                </p>
                <p className="policy-text">
                    Việc thu thập và sử dụng thông tin cá nhân chỉ được thực hiện khi có sự đồng ý của người dùng và được lưu trữ trong thời gian cần thiết theo quy định pháp luật. Website áp dụng các biện pháp kỹ thuật và quản lý phù hợp để bảo vệ thông tin cá nhân, không tiết lộ, mua bán hoặc chia sẻ cho bên thứ ba, trừ trường hợp có sự chấp thuận của người dùng hoặc theo yêu cầu của cơ quan nhà nước có thẩm quyền.
                </p>
                <p className="policy-text">
                    Người dùng có quyền kiểm tra, cập nhật, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân của mình thông qua các kênh hỗ trợ của website.
                </p>
            </section>

            <section className="policy-section" aria-label="Điều khoản dịch vụ">
                <h2 className="policy-section-title">Điều khoản dịch vụ</h2>
                <p className="policy-text">
                    Website hoạt động tuân thủ pháp luật Việt Nam và các quy định về thương mại điện tử theo Nghị định 52/2013/NĐ-CP. Khi truy cập và sử dụng website, người dùng được hiểu là đã đọc, hiểu và đồng ý với toàn bộ điều khoản dịch vụ này.
                </p>
                <p className="policy-text">
                    Người dùng có trách nhiệm cung cấp thông tin chính xác, bảo mật tài khoản và không sử dụng website cho các hành vi vi phạm pháp luật, gian lận thương mại hoặc gây ảnh hưởng đến quyền và lợi ích hợp pháp của tổ chức, cá nhân khác.
                </p>
                <p className="policy-text">
                    Website có quyền tạm ngừng hoặc chấm dứt cung cấp dịch vụ đối với các tài khoản vi phạm điều khoản đã công bố, đồng thời có trách nhiệm cung cấp thông tin đầy đủ, minh bạch về hàng hóa, dịch vụ, giá cả, phương thức thanh toán và giải quyết khiếu nại.
                </p>
                <p className="policy-text">
                    Mọi tranh chấp phát sinh trong quá trình sử dụng dịch vụ sẽ được ưu tiên giải quyết thông qua thương lượng, hòa giải; trường hợp không đạt được thỏa thuận sẽ được giải quyết theo quy định của pháp luật Việt Nam tại cơ quan nhà nước có thẩm quyền.
                </p>
            </section>
        </div>
    );
}
