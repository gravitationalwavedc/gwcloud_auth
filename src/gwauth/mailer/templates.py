"""
Distributed under the MIT License. See LICENSE.txt for more info.
"""

# Templates for different emails
VERIFY_EMAIL_ADDRESS = {
    'gwcloud': dict(),
    'gwlab': dict(),
    'gwlandscape': dict()
}

# Make localhost match gwcloud for testing purposes
VERIFY_EMAIL_ADDRESS['localhost'] = VERIFY_EMAIL_ADDRESS['gwcloud']

VERIFY_EMAIL_ADDRESS['gwcloud']['subject'] = \
    '[GWCloud] Please verify your email address'
VERIFY_EMAIL_ADDRESS['gwcloud']['message'] = \
    '<p>Dear {{first_name}} {{last_name}}: </p>' \
    '<p>We have received a new account request with our GWCloud system from this ' \
    'email address. Please verify your email address by clicking on the following ' \
    '<a href="{{link}}" target="_blank">link</a>: </p>' \
    '<p><a href="{{link}}" target="_blank">{{link}}</a> </p>' \
    '<p>If you believe that the email has been sent by mistake or you have not ' \
    'requested for an account please <strong>do not</strong> click on the link. </p>' \
    '<p>Alternatively you can report this incident to <a ' \
    'href="mailto:paul.lasky@monash.edu" target="_top">paul.lasky@monash.edu</a> for ' \
    'investigation. </p>' \
    '<p> </p>' \
    '<p>Regards, </p>' \
    '<p>GWCloud Team</p>'

VERIFY_EMAIL_ADDRESS['gwlab']['subject'] = \
    '[GWLab] Please verify your email address'
VERIFY_EMAIL_ADDRESS['gwlab']['message'] = \
    '<p>Dear {{first_name}} {{last_name}}: </p>' \
    '<p>We have received a new account request with our GWLab system from this ' \
    'email address. Please verify your email address by clicking on the following ' \
    '<a href="{{link}}" target="_blank">link</a>: </p>' \
    '<p><a href="{{link}}" target="_blank">{{link}}</a> </p>' \
    '<p>If you believe that the email has been sent by mistake or you have not ' \
    'requested for an account please <strong>do not</strong> click on the link. </p>' \
    '<p>Alternatively you can report this incident to <a ' \
    'href="mailto:pclearwater@swin.edu.au" target="_top">pclearwater@swin.edu.au</a> for ' \
    'investigation. </p>' \
    '<p> </p>' \
    '<p>Regards, </p>' \
    '<p>GWLab Team</p>'

VERIFY_EMAIL_ADDRESS['gwlandscape']['subject'] = \
    '[GWLandscape] Please verify your email address'
VERIFY_EMAIL_ADDRESS['gwlandscape']['message'] = \
    '<p>Dear {{first_name}} {{last_name}}: </p>' \
    '<p>We have received a new account request with our GWLandscape system from this ' \
    'email address. Please verify your email address by clicking on the following ' \
    '<a href="{{link}}" target="_blank">link</a>: </p>' \
    '<p><a href="{{link}}" target="_blank">{{link}}</a> </p>' \
    '<p>If you believe that the email has been sent by mistake or you have not ' \
    'requested for an account please <strong>do not</strong> click on the link. </p>' \
    '<p>Alternatively you can report this incident to <a ' \
    'href="mailto:ilya.mandel@monash.edu" target="_top">ilya.mandel@monash.edu</a> for ' \
    'investigation. </p>' \
    '<p> </p>' \
    '<p>Regards, </p>' \
    '<p>GWLandscape Team</p>'
