# Filtering events

The web dashboard offers intuitive customization for exploring occultation events, enabling users to easily adjust settings like date and time, visibility limits, geolocation, among other filters. This approach makes advanced filtering of occultation accessible to everyone.

### Date and time interval

Allows you to select a specific time and date interval. **Be aware that the selection is based on your local time (timezone of the device) while the closest approach of occultations is given in UTC.**

### Magnitude limit

Provides an upper magnitude limit.

### Filter type

There are three ways of filtering objects: by name/principal designation, dynamical class, and dynamical subclass:

- **Object name**: enter the name of the object and select it from the drop-down list. You can select multiple objects. If the name of the object does not appear on the drop-down list, it means that there are no occultations available for that object at the time.
- **Dynamical class**: selects the group of objects that belong to a specific dynamical class. Asteroid dynamical classes (and subclasses) are used as defined by Skybot ([more information](https://ssp.imcce.fr/webservices/skybot/)).
- **Dynamical subclass**: selects the group of objects that belong to a specific subclass.

### Nightime only

On by default, it filters out occultations whose paths happen exclusively during daytime and paths that do not cross the Earth at all.

### Local time filter

It is a step further to constraint the closest approach instant to a certain local time. Selecting a time range from 06 PM to 06 AM will filter out all events whose C/A instant is locally within this range. It helps, for example, filter out events that happen during dawn or dusk.

### Geolocation filter

*The geolocation filter is experimental and is intended to be the last filter option to be applied.* Since it is computationally costly, we recomend to filter down your results using the previous filtering options to an amount of **at most 2000 events** as indicated in the image below. It can be acomplished for instance using a narrower datetime interval or set of objects.

>**Atention**
><br/>Be aware that activating this filter without following the instructions will result either in incomplete results or in timeout by the server.

![Image Alt Text](../static/geolocation_filter.jpg)
