# <a name="subscription_guide"></a>Subscription Guide

This guide provides instructions for subscribing and setting up customized newsletter updates for the LIneA Solar System Occultation Prediction Database Portal. It explains how to register, log in, and adjust your subscription preferences for stellar occultation predictions.

## <a name="main_page"></a>Overview

At the top left of the page, users may find the following options:

- [Home](https://solarsystem.linea.org.br/): Redirects to the LIneA OPD home page.
- [About](https://solarsystem.linea.org.br/about-us): Redirects to a page with information about LIneA and the OPD.
- [Documentation](https://solarsystem.linea.org.br/docs/): Redirects to the documentation page.
- [Contact](https://solarsystem.linea.org.br/contact-us): Redirects to a page with information about LIneA's contact info, social media, and supporters.

Users may find three panels on the front page. At the top panel, three boards present the total number of predictions and small objects (TOTAL FORECAST), the predictions happening within the next 24h, this week, and next week (EVENTS TODAY), and the upcoming occultations in the next month (UPCOMING THIS MONTH).

Below, on the second panel, users may find a panel for filtering events. For details on how to use it, please check the [Filter Events Documentation](https://solarsystem.linea.org.br/docs/user-guide/filter-events/) page.

The third panel contains the prediction maps. For more information, please check the [Occultation Details Documentation](https://solarsystem.linea.org.br/docs/user-guide/occultation-details-page/) page.

At the bottom of the page, there is also important information about LIneA, its contact info, social media, and supporters.

## <a name="register"></a>Register / Subscribe

User subscription is not necessary to preview and obtain occultation results; the portal is **free** for anyone to use and visualize millions of occultation predictions by small bodies in the solar system. However, it is necessary to **subscribe** to the portal if you want to be informed of new updates in your interest predictions and receive periodic new predictions.

The subscription is very simple. On the [main page](https://solarsystem.linea.org.br/), right below the main title, there is a text box where you can enter your email and then click on the **SUBSCRIBE** button. You will receive an email to activate your account with the following text:

> _Thank you for subscribing to the LIneA Occultation Prediction Database. We are excited to have you on board. Before you start receiving customized predictions, we need to activate your account._
>
> _Please click the button below to proceed._
>
> <<_Activate Account_>>
> _Or copy and paste the following link into your browser to activate your account:_
>
> <<_https://solarsystem.linea.org.br/api/subscription/activate/<web-address_>>>
> _Best regards,
> The LIneA Team_

After clicking on the <<_Activate Account_>> button, you will be redirected to a page with the following text:

> _Thanks! You have successfully activated your subscription._
>
> _Please, check your email inbox._

Check your mailbox again. There must be an email with the following content:

> _Greetings,_
>
> _Customize your experience with our stellar occultation prediction database! You can choose specific objects, magnitude limits, and many other options aligned with your particular interests and geographic location._
>
> _To get started, customize your settings by clicking the button below:_
>
> <<_Customize Settings_>>
> _Best regards,
> The LIneA Team_

The <<_Customize Settings_>> button will redirect you to the login page. Enter your email in the textbox and click on the <<_SEND CODE_>> button. It will send you a 6-character code to your email. The code expires shortly, so please enter it soon. Check the number in your email, enter it in the textbox on the login page, and click on <<_SIGNIN_>>.

Now you will be able to customize your Newsletter Settings.

## <a name="login"></a>LogIn

Go to the top right corner and click on **LOGIN**. You will be redirected to a page where you must enter your email.

If it is your first time accessing the page and you don't have an account, click on the **Subscribe now** link (and follow the steps presented above in the **Register/Subscribe** section).

Enter your email in the textbox and click on the <<_SEND CODE_>> button. It will send you a 6-character code to your email. The code expires shortly, so please enter it soon. Check the number in your email, enter it in the textbox on the login page, and click on <<_SIGNIN_>>.

## <a name="options"></a>Registered User Tools and Options

Once you are logged in, two new icons will be available at the top right corner of the [main page](https://solarsystem.linea.org.br/):

- ![Text](../static/user-info.svg) **User Preferences**
- ![Text](../static/gear-icon.svg) **Subscription Settings**

Clicking either icon grants access to the subscription settings area.

Within this section, users can configure filters for selecting occultation events, adjust filter preferences, enable or disable email notifications, and delete their registered account.

## <a name="news_filter"></a>Configuring Filters

Upon accessing the Newsletter settings, the main page will display four panels: **Filter Settings**, **Email Filters**, **Email Subscription**, and **Delete Account**.

The first panel, **Filter Settings**, is for informational purposes only.

In the second panel, **Email Filters**, users can create and manage filters to receive occultation predictions. To add a new filter, click the **+ New Filter** button located at the top-right corner of the panel, then follow the instructions provided in the section below.

Once filters are created, a table will display them, allowing users to sort by **Name**, **Frequency**, or **Description**. Each row represents an individual filter, with options to edit or delete by clicking the pencil or trash icons, respectively.

When deleting a filter, clicking the trash icon will trigger the following confirmation message:

> _Delete this filter?_
> _This action cannot be undone._

Click **DELETE** to confirm removal or **CANCEL** to abort the operation.

In the third panel, **Email Subscription**, users can enable or disable email notifications by toggling the switch.

If notifications are **enabled** (active), the switch will be highlighted, and the following message will appear in green:

> _Your subscription is active, and you will receive emails based on your filter settings._

If notifications are **disabled**, the switch will appear gray, and the following message will appear in yellow/orange:

> _Your subscription is inactive, and you won't receive any emails._

In the fourth and final panel, **Delete Account**, users can click the **DELETE YOUR ACCOUNT** button to permanently delete their account.

> **Note:** Deleting your account is irreversible and will erase all filters and preferences. Ensure this is your intended action before proceeding.

## <a name="create_filter"></a>Create New Filter

After clicking the **+ New Filter** button at the top-right corner of the second panel, a new page will open, allowing users to create an email preference for the Newsletter. Some filters are required—**Filter Name**, **Frequency**, and **Geo Location** (Latitude, Longitude, and Radius)—while others are optional.

First, choose a **Filter Name** and select its **Frequency** (Daily, Weekly, or Monthly). Users may also add a brief **Description** of the filter (e.g., referencing a specific object, orbital class, or frequency).

Below the description box, optional filters can be set via the **Filter Type** dropdown. Users can select an object name, dynamic class, or dynamic class with subclasses. Once a selection is made, a corresponding dropdown will appear on the right with relevant options. Users can select multiple objects but only one class or subclass.

The next filter allows users to set a **Star Magnitude Limit**. Occultations of stars exceeding this magnitude (i.e., fainter stars) will not be included. To the right, users can specify a **Magnitude Drop** limit, excluding occultations with larger magnitude drops.

Subsequent filters allow users to define the time interval for **Event Start** and **Event End**.

Users can further refine alerts by setting limits for the **Minimum** and **Maximum Object Diameter**, **Event Duration**, and **Uncertainty**.

In the lower section, users must input the **Geo Location** details, including:

- **Latitude** (positive for North, negative for South)
- **Longitude** (positive for East, negative for West)
- **Radius** (enter '0' for a fixed location or specify the travel distance in km for observations)
- **Altitude**

Clicking the **MY LOCATION** button prompts the browser to retrieve the user's coordinates, which will automatically populate the fields. The **CLEAR LOCATION** button will reset all Geo Location fields.

To cancel filter creation, click the **DISCARD CHANGES** button.

Once all preferences are set, click the **SAVE FILTER** button at the bottom of the page. Users will be redirected to the **User Preferences** page.

## Filter Options

- **Filter Name** [char]: Name for the NEWSLetter filter - required field
- **Frequency** [dropdown]: time frequency to receive emails (Daily, Weekly, or Monthly) - required field
- **Description** [text]: NEWSLetter filter description
- **Filter type** [dropdown]: Type of selection (Object name, dynamic class, or dynamic class with subclasses)
- **Filter type - right** [dropdown]: subselection of Filter type
- **Magnitude limit** [dropdown]: star magnitude limit
- **Magnitude drop** [dropdown]: expected event magnitude drop
- **Show Events After** [time]: filter events that start after time (closest approach)
- **Show Events Before** [time]: filter events that start before time (closest approach)
- **Diameter Min** [number]: object minimum radius (in km)
- **Diameter Max** [number]: object maximum radius (in km)
- **Event duration** [number]: minimum event duration (in seconds)
- **Uncertainty** [number]: object uncertainty (in km)
- **Latitude** [number]: observer location latitude (North positive, South negative) (in degrees) - required field
- **Longitude** [number]: observer location longitude (East positive, West negative) (in degrees) - required field
- **Radius** [number]: distance possible for observer to realocate (put 'zero' for a fixed location) (in km) - required field
- **Altitude** [number]: observer location altitude (in m)
