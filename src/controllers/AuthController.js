// const passport = require('../config/passport');

// class AuthController {
//   static authenticate(req, res, next) {
//     passport.authenticate('windowslive', {
//       scope: [
//         'openid',
//         'profile',
//         'offline_access',
//         'https://graph.microsoft.com/Mail.Read'
//       ],
//       response_type: 'code'
//     })(req, res, next);
//   }

//   static callback(req, res, next) {
//     passport.authenticate('windowslive', { failureRedirect: '/login' })(req, res, () => {
//       res.redirect('/dashboard');
//     });
//   }

//   static getLoginURL(req, res) {
//     const authUrl = `/auth/outlook`;
//     res.status(200).json({ authUrl });
//   }
// }

// module.exports = AuthController;

// // const passport = require('../config/passport');

// // class AuthController {
// //     static authenticate(req, res, next) {
// //         passport.authenticate('windowslive', {
// //             scope: [
// //                'profile',
// //                 'openid',
// //                 'offline_access',
// //                 // 'https://graph.microsoft.com/User.Read',
// //                 'https://graph.microsoft.com/Mail.Read'
// //             ]
// //         })(req, res, next);
// //     }

// //     static callback(req, res, next) {
// //         passport.authenticate('windowslive', { failureRedirect: '/login' })(req, res, () => {
// //             res.redirect('/dashboard');
// //         });
// //     }

// //     static getLoginURL(req, res) {
// //         const authUrl = `/auth/outlook`;
// //         res.status(200).json({ authUrl });
// //     }
// // }

// // module.exports = AuthController;

const passport = require('../config/passport');

class AuthController {
  static callback(req, res) {
    // Successful authentication, redirect to frontend or dashboard
    res.redirect('/dashboard');
  }

  static getLoginURL(req, res) {
    const authUrl = `/auth/microsoft`;
    res.status(200).json({ authUrl });
  }
}

module.exports = AuthController;