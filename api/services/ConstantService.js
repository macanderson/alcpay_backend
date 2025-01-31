module.exports = {
    standardDateTime: 'YYYY-MM-DD HH:mm:ss',
    trackingBaseUrl: `${process.env.WEB_HOST}/add-tracking/`,
    staffRole: {
        SUPER_ADMIN: 0,
        MANAGER: 1,
        BRAND: 3
    },
    prefixAccessId: {
        SUPER_ADMIN: 'SA',
        STAFF: 'S',
        USER: 'U',
        BRAND: 'B'
    },
    pushSource: {
        ANDROID: 'ANDROID',
        IOS: 'IOS',
        WEB: 'WEB'
    },
    requestCode: {
        SUCCESS: 200,
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
        UNAUTHORIZED: 401,
        INTERNAL_SERVER_ERROR: 500
    },
    userType: {
        SUPER_ADMIN: 0,
        STAFF: 1,
        USER: 2,
        BRAND: 3
    },
    responseMessage: {

        //IsAuthorized
        ERR_MSG_WRONG_FORMAT_AUTHORIZATION: "Format is Authorization: Bearer [token]",
        ERR_MSG_NO_HEADER_AUTHORIZATION: "Please login to access this feature!",
        ERR_MSG_RESTRICTED: "This api is restricted! Please contact support.",
        ERR_MSG_INVALID_SESSION: "Session expired! Please login again!",

        ERR_MSG_WRONG_CREDENTIALS_API: "Email or password is wrong.",
        ERR_MSG_WRONG_CREDENTIALS_USER_API: "Contact number or password is wrong.",
        WRONG_PASSWORD: "Password is wrong.",
        LOG_IN_SUCCESS: "Logged in successfully!",
        LOG_OUT_SUCCESS: "You are logged out!",
        NO_USER_FOUND: "No user found for this session. Is the user active?",

        //Super admin Controller
        ERR_MSG_ISSUE_IN_SUPER_ADMIN_LOGIN_API: "Oops! Something went wrong in super admin login api!",
        ERR_MSG_ISSUE_IN_SUPER_ADMIN_LOGOUT_API: "Oops! Something went wrong in super admin logout api!",

        //Admin Session controller
        ERR_MSG_ISSUE_IN_ADMIN_LOGIN_API: "Oops! Something went wrong in admin login api!",
        ERR_MSG_ISSUE_IN_ADMIN_ACCESS_TOKEN_LOGIN_API: "Oops! Something went wrong in admin access token login api!",
        ERR_MSG_ISSUE_IN_ADMIN_LOGOUT_API: "Oops! Something went wrong in admin logout api!",

        //Staff Controller - errors
        ERR_MSG_ISSUE_IN_ADD_STAFF_API: "Oops! Something went wrong in add staff api!",
        ERR_MSG_ISSUE_IN_EDIT_STAFF_API: "Oops! Something went wrong in edit staff api!",
        ERR_MSG_ISSUE_IN_DELETE_STAFF_API: "Oops! Something went wrong in delete staff api!",
        ERR_MSG_ISSUE_IN_RESET_PASSWORD_STAFF_API: "Oops! Something went wrong in reset password staff api!",
        ERR_MSG_ISSUE_IN_STAFF_LIST_API: "Oops! Something went wrong in staff list api!",

        //Staff Controller - general
        STAFF_ADDED_SUCCESS: "Staff has been added successfully.",
        STAFF_EDIT_SUCCESS: "Staff has been updated successfully.",
        STAFF_DELETE_SUCCESS: "Staff has been deleted successfully.",
        ENTER_VALID_PASSWORD: "Enter valid password",
        PASSWORD_CHANGE_SUCCESS: "Password has been changed successfully.",
        STAFF_EMAIL_ALREADY_REGISTERED: "Staff's email already registered!",
        STAFF_NOT_FOUND: "No staff found with this id! Is the staff deleted?",
        NO_STAFF_ID_FOUND: "No staff id found!",
        STAFF_LIST: "Staff list",
        STAFF_CONTACT_NUMBER_ALREADY_REGISTERED: "Staff contact number already registered!",

        //Account Controller
        ACCOUNT_ALREADY_LINKED: "This Location Id is already linked to an account!",

        //Global
        SUCCESS_MSG: "success",
        FAILURE_MSG: "failure",
        NO_UTC_OFFSET_FOUND: "No utc offset added! UTC is required",

        //Rule controller
        SORRY_THIS_PRODUCT_RULE_IS_ALREADY_AVAILABLE: "This product rule is already available.",
        SORRY_THIS_STATE_RULE_IS_ALREADY_AVAILABLE: "This state rule is already available."
    }
};
