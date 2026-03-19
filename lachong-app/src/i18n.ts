import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

function normalizeLanguage(value: unknown): 'vi' | 'en' {
    const raw = String(value ?? '').toLowerCase();
    if (raw === 'en' || raw.startsWith('en-')) return 'en';
    if (raw === 'vi' || raw.startsWith('vi-')) return 'vi';
    return 'vi';
}

const resources = {
    vi: {
        translation: {
            header: {
                home: 'Trang chủ',
                shop: 'Sản phẩm',
                community: 'Cộng đồng',
                about: 'Giới thiệu',
                searchPlaceholder: 'Tìm kiếm sản phẩm...',
                notifications: 'Thông báo',
                cart: 'Giỏ hàng',
                language: 'Ngôn ngữ',
                dashboard: 'Bảng điều khiển',
                profile: 'Hồ sơ',
                chat: 'Chat',
                wishlist: 'Yêu thích',
                logout: 'Đăng xuất',
                signIn: 'Đăng nhập',
                options: 'Tuỳ chọn'
            },
            home: {
                categoriesAria: 'Danh mục sản phẩm',
                categoriesTitle: 'Danh mục',
                loading: 'Đang tải...',
                categoryFallback: 'Danh mục',
                bannerAria: 'Banner',
                bannerAlt: 'Banner',
                chooseBannerAria: 'Chọn banner',
                bannerDotAria: 'Banner {{index}}',
                shopNow: 'Mua ngay',
                slides: {
                    main: {
                        kicker: 'Lạc Hồng',
                        title: 'Ưu đãi đến 10%',
                        subtitle: 'Voucher'
                    },
                    login: {
                        kicker: 'Sản phẩm thủ công',
                        title: 'Khám phá',
                        subtitle: 'Bộ sưu tập mới'
                    }
                }
            },
            topProduct: {
                newArrivals: 'Sản phẩm mới',
                topDiscount: 'Giảm giá',
                topSelling: 'Bán chạy',
                viewAll: 'Xem tất cả'
            },
            productDetails: {
                invalidId: 'ID sản phẩm không hợp lệ',
                notFound: 'Không tìm thấy sản phẩm',
                notFoundDot: 'Không tìm thấy sản phẩm.',
                cannotLoad: 'Không tải được sản phẩm',
                loadingProduct: 'Đang tải sản phẩm...',
                backToProducts: '← Quay lại danh sách sản phẩm',

                loginToAddCart: 'Vui lòng đăng nhập để thêm vào giỏ hàng',
                updateProfileBeforeCart: 'Vui lòng cập nhật thông tin cá nhân trước khi thêm vào giỏ hàng',
                cannotFetchAccount: 'Không lấy được thông tin tài khoản',

                description: 'Mô tả sản phẩm',
                category: 'Danh mục',
                material: 'Chất liệu',
                stock: 'Tồn kho',
                stockUnit: 'sản phẩm',
                warrantyPolicy: 'Chính sách bảo hành',
                noPolicy: 'Chưa có mô tả cho sản phẩm này.',

                off: 'Giảm {{percent}}%',

                onlyLeftInStock: 'Chỉ còn {{count}} sản phẩm trong kho!',
                addedToCart: 'Đã thêm sản phẩm vào giỏ!',
                cannotAddToCart: 'Không thể thêm vào giỏ',
                adding: 'Đang thêm...',
                addToCart: 'Thêm vào giỏ hàng',

                addedToWishlist: 'Đã thêm vào danh sách yêu thích!',
                alreadyInWishlist: 'Sản phẩm đã có trong danh sách yêu thích',
                cannotAddToWishlist: 'Không thể thêm vào danh sách yêu thích',

                chooseContent: 'Chọn nội dung',
                related: 'Sản phẩm liên quan',
                reviews: 'Đánh giá'
            },
            productRelated: {
                title: 'Sản phẩm liên quan',
                loading: 'Đang tải sản phẩm liên quan...',
                empty: 'Chưa có gợi ý phù hợp.'
            },
            productReview: {
                title: 'Đánh giá sản phẩm',
                subtitle: 'Chia sẻ cảm nhận và xem nhận xét từ người khác.',
                outOfFive: '/ 5',
                count: '{{count}} đánh giá',
                addReview: '+ Đánh giá',
                loginToReview: 'Vui lòng đăng nhập để đánh giá sản phẩm',

                loading: 'Đang tải đánh giá...',
                empty: 'Chưa có đánh giá nào.',
                anonymous: 'Ẩn danh',

                imagesAria: 'Ảnh đánh giá',
                imageAria: 'Ảnh {{index}}',

                optionsAria: 'Tùy chọn',
                edit: 'Sửa',
                delete: 'Xóa',

                prev: 'Trước',
                next: 'Sau',
                pageIndicator: 'Trang {{page}} / {{total}}',

                modalAddTitle: 'Thêm đánh giá',
                modalEditTitle: 'Cập nhật đánh giá',
                close: 'Đóng',

                ratingLabel: 'Đánh giá',
                ratingAria: 'Đánh giá',
                starAria: '{{count}} sao',
                ratingHint: 'Chỉ có thể đánh giá khi đã mua sản phẩm.',

                commentLabel: 'Nhận xét',
                commentPlaceholder: 'Chia sẻ trải nghiệm của bạn...',

                imagesLabel: 'Ảnh đánh giá (tối đa {{max}})',
                selectedImagesAria: 'Ảnh đã chọn',
                removeImage: 'Xóa ảnh',
                pickImages: 'Chọn ảnh',
                cancel: 'Hủy',

                saving: 'Đang lưu...',
                update: 'Cập nhật',
                submit: 'Gửi đánh giá',

                toastOnlyImages: 'Chỉ hỗ trợ file ảnh',
                toastImageTooLarge: 'Ảnh quá lớn (tối đa {{max}}MB/ảnh)',
                toastMaxImages: 'Tối đa {{max}} ảnh cho mỗi đánh giá',
                toastUpdated: 'Đã cập nhật đánh giá',
                toastAdded: 'Đã thêm đánh giá',
                toastCannotSave: 'Không thể lưu đánh giá',
                toastDeleted: 'Đã xóa đánh giá',
                toastCannotDelete: 'Không thể xóa',

                viewerAria: 'Xem ảnh'
            },
            post: {
                addPost: '+ Thêm bài viết',
                loadingPosts: 'Đang tải bài viết...',
                emptyPosts: 'Chưa có bài viết nào.',

                anonymous: 'Ẩn danh',
                avatarAlt: 'Ảnh đại diện',
                postImageAlt: 'Ảnh bài viết',

                optionsAria: 'Tùy chọn',
                edit: 'Sửa',
                delete: 'Xóa',

                likesCount: '{{count}} lượt thích',
                commentsCount: '{{count}} bình luận',

                confirmDeletePost: 'Xóa bài viết này?',

                toast: {
                    cannotLoadPosts: 'Không tải được bài viết',
                    cannotLike: 'Không thể thực hiện like',
                    pleaseLoginToLikeComment: 'Vui lòng đăng nhập để thích bình luận',
                    cannotLikeComment: 'Không thể thích bình luận',
                    pleaseLoginToComment: 'Vui lòng đăng nhập để bình luận',
                    commentUpdated: 'Đã cập nhật bình luận',
                    commentSent: 'Đã gửi bình luận',
                    cannotComment: 'Không thể bình luận',
                    onlyCustomerCanComment: 'Chỉ tài khoản khách hàng mới bình luận được',
                    postUpdated: 'Đã cập nhật bài viết',
                    postCreated: 'Đã tạo bài viết',
                    cannotSavePost: 'Không thể lưu bài viết',
                    postDeleted: 'Đã xóa bài viết',
                    cannotDeletePost: 'Không thể xóa bài viết',
                    pleaseLoginToDeleteComment: 'Vui lòng đăng nhập để xóa bình luận',
                    commentDeleted: 'Đã xóa bình luận',
                    cannotDeleteComment: 'Không thể xóa bình luận'
                },

                share: {
                    shareFacebook: 'Chia sẻ Facebook',
                    shareZalo: 'Chia sẻ Zalo',
                    copyLink: 'Copy link',
                    close: 'Đóng',
                    copySuccess: 'Đã copy link!',
                    copyFail: 'Không copy được link!'
                },

                form: {
                    headerUpdate: 'Cập nhật bài viết',
                    headerCreate: 'Thêm bài viết',
                    submitUpdate: 'Cập nhật',
                    submitCreate: 'Tạo'
                },

                confirmDeleteComment: 'Bạn có chắc muốn xóa bình luận này?'
            },
            postComments: {
                title: 'Bình luận',
                reply: 'Trả lời',
                commentOptionsAria: 'Tùy chọn bình luận',
                viewMoreReplies: 'Xem thêm {{count}} trả lời',
                collapse: 'Thu gọn',

                editing: 'Đang sửa bình luận',
                cancelEdit: 'Hủy sửa',
                replyingTo: 'Đang trả lời',
                cancel: 'Hủy',

                placeholderEdit: 'Sửa bình luận...',
                placeholderReply: 'Trả lời {{name}}...',
                placeholderWrite: 'Viết bình luận...',
                sendAria: 'Gửi bình luận',
                closeAria: 'Đóng',
                empty: 'Chưa có bình luận nào.'
            },
            postForm: {
                closeAria: 'Đóng',
                titleLabel: 'Tiêu đề',
                titlePlaceholder: 'Nhập tiêu đề',
                contentLabel: 'Nội dung',
                contentFormatAria: 'Định dạng nội dung',
                imagesLabel: 'Ảnh',
                deleteImageAria: 'Xóa ảnh',
                cancel: 'Hủy',
                saving: 'Đang lưu...'
            },
            aboutPage: {
                title: 'Câu chuyện Lạc Hồng',
                hero: {
                    p1: 'Lạc Hồng là sàn thương mại điện tử chuyên biệt về đồ gốm và sản phẩm thủ công mỹ nghệ truyền thống Việt Nam, được xây dựng với sứ mệnh kết nối nghệ nhân với cộng đồng yêu giá trị thủ công trong và ngoài nước.',
                    p2: 'Chúng tôi tạo ra một không gian số nơi các nghệ nhân, làng nghề và xưởng thủ công có thể trực tiếp tham gia, đăng tải và kinh doanh sản phẩm của mình một cách minh bạch, thuận tiện và bền vững. Mỗi sản phẩm trên Lạc Hồng không chỉ là một món hàng, mà còn là câu chuyện về văn hóa, bàn tay và tâm hồn của người làm nghề.',
                    p3Intro: 'Bên cạnh chức năng mua bán, Lạc Hồng còn phát triển diễn đàn cộng đồng, nơi các nghệ nhân, người yêu thủ công và khách hàng có thể:'
                },
                community: {
                    bullet1: 'Chia sẻ câu chuyện làng nghề',
                    bullet2: 'Đăng bài giao lưu, trao đổi kinh nghiệm',
                    bullet3: 'Thảo luận về kỹ thuật, chất liệu và xu hướng thủ công mỹ nghệ',
                    bullet4: 'Gìn giữ và lan tỏa giá trị văn hóa truyền thống'
                },
                closing: 'Với định hướng phát triển bền vững, Lạc Hồng mong muốn trở thành cầu nối giữa truyền thống và hiện đại, góp phần bảo tồn làng nghề, nâng cao giá trị sản phẩm thủ công Việt Nam và đưa tinh hoa văn hóa Việt vươn xa.',
                mediaAlt: 'Lạc Hồng – đồ gốm và thủ công mỹ nghệ',
                sections: {
                    mission: {
                        aria: 'Sứ mệnh',
                        title: 'Sứ mệnh',
                        p1: 'Lạc Hồng mang sứ mệnh kết nối và nâng tầm giá trị thủ công mỹ nghệ Việt Nam thông qua nền tảng thương mại điện tử hiện đại, minh bạch và bền vững.',
                        p2: 'Chúng tôi hướng đến việc trao quyền cho nghệ nhân và làng nghề truyền thống, giúp họ tiếp cận thị trường rộng lớn hơn, kể câu chuyện nghề một cách trọn vẹn và tạo ra giá trị kinh tế song hành cùng giá trị văn hóa.'
                    },
                    vision: {
                        aria: 'Tầm nhìn',
                        title: 'Tầm nhìn',
                        p1: 'Lạc Hồng hướng tới trở thành sàn thương mại điện tử hàng đầu về thủ công mỹ nghệ Việt Nam, là điểm đến tin cậy cho cộng đồng yêu văn hóa thủ công trong và ngoài nước.',
                        p2: 'Chúng tôi mong muốn xây dựng một hệ sinh thái số cho làng nghề, nơi truyền thống được bảo tồn, sáng tạo được khuyến khích và giá trị văn hóa Việt được lan tỏa bền vững trên thị trường toàn cầu.'
                    },
                    policy: {
                        aria: 'Chính sách',
                        title: 'Chính sách',
                        join: {
                            title: 'Chính sách tham gia sàn',
                            p1: 'Lạc Hồng là nền tảng mở dành cho nghệ nhân, làng nghề, cơ sở sản xuất và kinh doanh thủ công mỹ nghệ truyền thống Việt Nam.',
                            p2: 'Các đơn vị tham gia sàn cần cung cấp thông tin trung thực, đầy đủ và hợp pháp, chịu trách nhiệm trước pháp luật về sản phẩm, nội dung và hoạt động kinh doanh của mình trên Lạc Hồng.',
                            p3: 'Lạc Hồng có quyền xét duyệt, từ chối hoặc tạm ngưng gian hàng nếu phát hiện hành vi vi phạm quy định, ảnh hưởng đến uy tín cộng đồng và giá trị văn hóa thủ công.'
                        },
                        product: {
                            title: 'Chính sách sản phẩm',
                            bullet1: 'Sản phẩm đăng bán phải là đồ gốm, thủ công mỹ nghệ, đan lát và các sản phẩm liên quan đến làng nghề truyền thống.',
                            bullet2: 'Thông tin sản phẩm cần mô tả rõ ràng về nguồn gốc, chất liệu, kích thước, giá bán và hình ảnh thực tế.',
                            bullet3: 'Nghiêm cấm đăng tải sản phẩm giả mạo, sao chép, vi phạm bản quyền, trái pháp luật hoặc không đúng với giá trị thủ công truyền thống.',
                            bullet4: 'Lạc Hồng khuyến khích các sản phẩm mang yếu tố thủ công, bền vững, thân thiện môi trường và có câu chuyện văn hóa rõ ràng.'
                        }
                    }
                }
            }
        }
    },
    en: {
        translation: {
            header: {
                home: 'Home',
                shop: 'Shop',
                community: 'Community',
                about: 'About',
                searchPlaceholder: 'Search products...',
                notifications: 'Notifications',
                cart: 'Cart',
                language: 'Language',
                dashboard: 'Dashboard',
                profile: 'Profile',
                chat: 'Chat',
                wishlist: 'Wishlist',
                logout: 'Logout',
                signIn: 'Sign in',
                options: 'Options'
            },
            home: {
                categoriesAria: 'Product categories',
                categoriesTitle: 'Categories',
                loading: 'Loading...',
                categoryFallback: 'Category',
                bannerAria: 'Banner',
                bannerAlt: 'Banner',
                chooseBannerAria: 'Select banner',
                bannerDotAria: 'Banner {{index}}',
                shopNow: 'Shop now',
                slides: {
                    main: {
                        kicker: 'Lac Hong',
                        title: 'Up to 10% off',
                        subtitle: 'Voucher'
                    },
                    login: {
                        kicker: 'Handcrafted products',
                        title: 'Explore',
                        subtitle: 'New collection'
                    }
                }
            },
            topProduct: {
                newArrivals: 'New arrivals',
                topDiscount: 'Top discount',
                topSelling: 'Top selling',
                viewAll: 'View all'
            },
            productDetails: {
                invalidId: 'Invalid product ID',
                notFound: 'Product not found',
                notFoundDot: 'Product not found.',
                cannotLoad: 'Unable to load product',
                loadingProduct: 'Loading product...',
                backToProducts: '← Back to product list',

                loginToAddCart: 'Please sign in to add to cart',
                updateProfileBeforeCart: 'Please update your profile before adding to cart',
                cannotFetchAccount: 'Unable to fetch account information',

                description: 'Product description',
                category: 'Category',
                material: 'Material',
                stock: 'Stock',
                stockUnit: 'items',
                warrantyPolicy: 'Policy',
                noPolicy: 'No policy details for this product yet.',

                off: '{{percent}}% off',

                onlyLeftInStock: 'Only {{count}} left in stock!',
                addedToCart: 'Added to cart!',
                cannotAddToCart: 'Unable to add to cart',
                adding: 'Adding...',
                addToCart: 'Add to cart',

                addedToWishlist: 'Added to wishlist!',
                alreadyInWishlist: 'Product is already in your wishlist',
                cannotAddToWishlist: 'Unable to add to wishlist',

                chooseContent: 'Select content',
                related: 'Related products',
                reviews: 'Reviews'
            },
            productRelated: {
                title: 'Related products',
                loading: 'Loading related products...',
                empty: 'No suggestions yet.'
            },
            productReview: {
                title: 'Product reviews',
                subtitle: 'Share your thoughts and read what others say.',
                outOfFive: '/ 5',
                count: '{{count}} reviews',
                addReview: '+ Review',
                loginToReview: 'Please sign in to review this product',

                loading: 'Loading reviews...',
                empty: 'No reviews yet.',
                anonymous: 'Anonymous',

                imagesAria: 'Review images',
                imageAria: 'Image {{index}}',

                optionsAria: 'Options',
                edit: 'Edit',
                delete: 'Delete',

                prev: 'Prev',
                next: 'Next',
                pageIndicator: 'Page {{page}} / {{total}}',

                modalAddTitle: 'Add review',
                modalEditTitle: 'Update review',
                close: 'Close',

                ratingLabel: 'Rating',
                ratingAria: 'Rating',
                starAria: '{{count}} stars',
                ratingHint: 'You can only review after purchasing the product.',

                commentLabel: 'Comment',
                commentPlaceholder: 'Share your experience...',

                imagesLabel: 'Review images (max {{max}})',
                selectedImagesAria: 'Selected images',
                removeImage: 'Remove image',
                pickImages: 'Choose images',
                cancel: 'Cancel',

                saving: 'Saving...',
                update: 'Update',
                submit: 'Submit review',

                toastOnlyImages: 'Only image files are supported',
                toastImageTooLarge: 'Image is too large (max {{max}}MB each)',
                toastMaxImages: 'Up to {{max}} images per review',
                toastUpdated: 'Review updated',
                toastAdded: 'Review added',
                toastCannotSave: 'Unable to save review',
                toastDeleted: 'Review deleted',
                toastCannotDelete: 'Unable to delete',

                viewerAria: 'View image'
            },
            post: {
                addPost: '+ Add post',
                loadingPosts: 'Loading posts...',
                emptyPosts: 'No posts yet.',

                anonymous: 'Anonymous',
                avatarAlt: 'Avatar',
                postImageAlt: 'Post image',

                optionsAria: 'Options',
                edit: 'Edit',
                delete: 'Delete',

                likesCount: '{{count}} likes',
                commentsCount: '{{count}} comments',

                confirmDeletePost: 'Delete this post?',

                toast: {
                    cannotLoadPosts: 'Unable to load posts',
                    cannotLike: 'Unable to update like',
                    pleaseLoginToLikeComment: 'Please sign in to like comments',
                    cannotLikeComment: 'Unable to like comment',
                    pleaseLoginToComment: 'Please sign in to comment',
                    commentUpdated: 'Comment updated',
                    commentSent: 'Comment posted',
                    cannotComment: 'Unable to comment',
                    onlyCustomerCanComment: 'Only customer accounts can comment',
                    postUpdated: 'Post updated',
                    postCreated: 'Post created',
                    cannotSavePost: 'Unable to save post',
                    postDeleted: 'Post deleted',
                    cannotDeletePost: 'Unable to delete post',
                    pleaseLoginToDeleteComment: 'Please sign in to delete comments',
                    commentDeleted: 'Comment deleted',
                    cannotDeleteComment: 'Unable to delete comment'
                },

                share: {
                    shareFacebook: 'Share on Facebook',
                    shareZalo: 'Share on Zalo',
                    copyLink: 'Copy link',
                    close: 'Close',
                    copySuccess: 'Link copied!',
                    copyFail: 'Unable to copy link!'
                },

                form: {
                    headerUpdate: 'Update post',
                    headerCreate: 'Add post',
                    submitUpdate: 'Update',
                    submitCreate: 'Create'
                },

                confirmDeleteComment: 'Are you sure you want to delete this comment?'
            },
            postComments: {
                title: 'Comments',
                reply: 'Reply',
                commentOptionsAria: 'Comment options',
                viewMoreReplies: 'View {{count}} more replies',
                collapse: 'Collapse',

                editing: 'Editing comment',
                cancelEdit: 'Cancel edit',
                replyingTo: 'Replying to',
                cancel: 'Cancel',

                placeholderEdit: 'Edit comment...',
                placeholderReply: 'Reply to {{name}}...',
                placeholderWrite: 'Write a comment...',
                sendAria: 'Send comment',
                closeAria: 'Close',
                empty: 'No comments yet.'
            },
            postForm: {
                closeAria: 'Close',
                titleLabel: 'Title',
                titlePlaceholder: 'Enter a title',
                contentLabel: 'Content',
                contentFormatAria: 'Content formatting',
                imagesLabel: 'Images',
                deleteImageAria: 'Remove image',
                cancel: 'Cancel',
                saving: 'Saving...'
            },
            aboutPage: {
                title: 'The Lac Hong Story',
                hero: {
                    p1: 'Lac Hong is an e-commerce platform dedicated to ceramics and traditional Vietnamese handicrafts, built with the mission of connecting artisans with a community that values handmade craft both in Vietnam and abroad.',
                    p2: 'We create a digital space where artisans, craft villages, and workshops can participate directly, publish their offerings, and sell their products in a transparent, convenient, and sustainable way. Every product on Lac Hong is not only an item for sale, but also a story of culture, hands, and the soul of its maker.',
                    p3Intro: 'Alongside buying and selling, Lac Hong also develops a community forum where artisans, craft lovers, and customers can:'
                },
                community: {
                    bullet1: 'Share stories from craft villages',
                    bullet2: 'Post and exchange experiences',
                    bullet3: 'Discuss techniques, materials, and handicraft trends',
                    bullet4: 'Preserve and spread traditional cultural values'
                },
                closing: 'With a sustainability-driven direction, Lac Hong aims to become a bridge between tradition and modernity—helping preserve craft villages, enhancing the value of Vietnamese handmade products, and bringing Vietnamese cultural essence further to the world.',
                mediaAlt: 'Lac Hong – ceramics and handicrafts',
                sections: {
                    mission: {
                        aria: 'Mission',
                        title: 'Mission',
                        p1: 'Lac Hong’s mission is to connect and elevate the value of Vietnamese handicrafts through a modern, transparent, and sustainable e-commerce platform.',
                        p2: 'We aim to empower artisans and traditional craft villages—helping them reach broader markets, tell their craft stories more fully, and create economic value alongside cultural value.'
                    },
                    vision: {
                        aria: 'Vision',
                        title: 'Vision',
                        p1: 'Lac Hong strives to become the leading e-commerce marketplace for Vietnamese handicrafts, and a trusted destination for communities that love craft culture both domestically and internationally.',
                        p2: 'We aspire to build a digital ecosystem for craft villages—where tradition is preserved, creativity is encouraged, and Vietnamese cultural values are sustainably shared in the global market.'
                    },
                    policy: {
                        aria: 'Policies',
                        title: 'Policies',
                        join: {
                            title: 'Marketplace participation policy',
                            p1: 'Lac Hong is an open platform for artisans, craft villages, manufacturers, and businesses of traditional Vietnamese handicrafts.',
                            p2: 'Participants must provide truthful, complete, and lawful information, and are legally responsible for their products, content, and business activities on Lac Hong.',
                            p3: 'Lac Hong reserves the right to review, reject, or suspend a storefront if violations are detected that affect community reputation and craft cultural values.'
                        },
                        product: {
                            title: 'Product policy',
                            bullet1: 'Listed products must be ceramics, handicrafts, weaving/basketry, and other items related to traditional craft villages.',
                            bullet2: 'Product information should clearly describe origin, materials, dimensions, pricing, and real photos.',
                            bullet3: 'It is strictly prohibited to post counterfeit, copied, copyright-infringing, illegal products, or items that do not align with traditional handicraft values.',
                            bullet4: 'Lac Hong encourages products that are handcrafted, sustainable, eco-friendly, and have clear cultural stories.'
                        }
                    }
                }
            }
        }
    }
} as const;

const initialLang = normalizeLanguage(localStorage.getItem('app_lang'));

void i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: initialLang,
        fallbackLng: 'vi',
        interpolation: { escapeValue: false }
    });

export default i18n;
export { normalizeLanguage };
