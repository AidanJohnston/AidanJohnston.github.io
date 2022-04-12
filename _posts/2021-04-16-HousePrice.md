---
layout: post
title: 'Predicting House Prices using Regression Techniques'
tags: Python Jupyter-Notebook Regression
category: colab
link: https://colab.research.google.com/drive/1nYI-q2O82n8hqQwLjqKrJ5QpPwWH7nCr?usp=sharing
---
A machine learning model capable of pre  dicting the sale price of a given house given a large set of explanatory variables.

The model developed during this project will be submitted to an ongoing competition on Kaggle, which hosts a variety of machine learning competitions. 

During this project different regression techniques were tested.  We tested with different unskew methods and found that log1p is the best catch all method for our needs.  We preprocessed our data by combining similar features, removing unwanted NaN values, and encoding ordinal features.  We tested many feature selection, scaling and regression methods.  It was found that the MaxAbsScaler combined with XGBoost regression created the best validation scores.  We applied wrapper feature selection to pick the top 175 features to use for training.  We did hyperparameter tuning to find the best parameters for the XGBoost regressor.  The final validation R2 score was around 0.9 and our root mean squared logarithmic error after submitting to Kaggle was 0.12257.

# Data Exploration

Before we begin to actually perform preprocessing and feature selection,
it is important to explore the dataset. For this project, the dataset
consists of 80 different features. When looking at the data types for
these features our data types come out to *float64(12)*, *int64(25)*,
and *object(43)*. 37/80 of our dataset is numerical and 43/80 of our
data set is categorical. However, when checking *dataDiscription.txt* we
can see that MSSubClass is supposed to be categorical rather than
numerical.

Furthermore, when looking specifically at sales price, it can be seen
that the sales price is always an integer. Our output for our model will
be as a float. We will need to round our outputs.

## Skewness

Another important thing to check is how skewed our data is. Later on we
will address all numerical features and check their skewness, but for
now let's just look at our independent variable, sales price. As seen in
[figure 1](#fig:SalesPriceDefualt) the sales price is skewed to the
right. Three different methods were testing on solving skewed data.
These are taking the *np.log1p*, *np.sqrt* and *scipy.stats.boxcox* of
our dataset.

<p align="center">
<img src="https://imgur.com/DWI4zcF.png" id="fig:SalesPriceDefualt">
</p>
<p align="center">
Figure 1: Histogram of default sales price.
</p>


### np.sprt()

The first method attempted to remove the skewness from sales price was
with *np.sqrt*. *Np.sqrt* is simple, it just takes the square root of
our feature list. After applying *np.sqrt* its results can seen in
[figure 2](#fig:SalePriceSqrt). While *np.sqrt* slightly unskews our
data it still leaves it with a skew factor of 0.9 which is still
relatively high.
<p align="center">
<img src="https://imgur.com/ZbiVoAJ.png" id="fig:SalePriceSqrt">
</p>
<p align="center">
Figure 2: Sales with square root method applied.
</p>

### np.log1p()

The next attempted method was *np.log1p*. *Np.log1p* is defined as:
log1p(x) = log(x+1) After applying *np.log1p* we achieved the
following results as shown in [figure
3](#fig:SalePriceLog1p). *Np.log1p* does a very good job at
unskewing our data. We are left with skewness of 0.12 which is very
good.

<p align="center">
<img src="https://imgur.com/fEp8nIB.png" id="fig:SalePriceLog1p">
</p>
<p align="center">
Figure 3: Sales with log1p method applied.
</p>

### scipy.stats.boxcox()

Finally, the method *boxcox* was attempted. *Boxcox* is defined as:

<p align="center">
<img src="https://imgur.com/qyw9Fxo.png">
</p>

With *boxcox*, a value for lambda optimally selected internally. An
important thing to consider is that *boxcox* requires that its input be
non negative. All our values for sales price are non negative so
*boxcox* can be applied. After applying *boxcox* we get the following
given [figure 4](#fig:SalePriceBoxcox).

<p align="center">
<img src="https://imgur.com/KBXfcGj.png" id="fig:SalePriceLog1p">
</p>
<p align="center">
Figure 4: Sales with boxcox method applied.
</p>

Our skewness is very close to 0, this is very good.

## Unskew Method Selection

After looking at the results of *boxcox*, *np.sqrt*, and *np.log1p*,
*boxcox* appear to be the clear winner. However, later on we wish to use
this same method to unskew the rest of our numerical features. Some of
our features contain negative values. As such *np.log1p* was selected as
it provides good results and can handle a wider range of input.

# Prepossessing

The main goal for data preprocessing is to clean up the data. This
involves amputating NA values, identifying categorical data and
quantitative data, and then creating dummy columns for the categorical
data. When processing the data the first big problem that arose was when
one hot encoding features for our training dataframe and our testing
dataframe. If one hot encoding is done separately, some new features
created will be missing. This is because either our training and testing
set contain inconsistent enum values. If one hot encoding is done
separately, the length of total features will be different between our
training and testing set. Concatenating our training and testing set,
performing the one hot encoding and our other prepossessing methods, and
then splitting our sets back up guarantees that our final feature list
between training and testing will be the same.

## Fix Nan Values

The other important element to data preprocessing is to clean up missing
and NA values. For some of the columns NA is actually an enum value and
doesn' t need to be changed. For other columns, mainly quantitative
ones, NA needs to be fixed. We chose to replace quantitative NA values
with the features mode.

## Feature Merging

While looking at some of the features, it can be seen that some features
can be combined. The following features were combined:

```
houseDF["SqFtPerRoom"] = houseDF["GrLivArea"] / (houseDF["TotRmsAbvGrd"] + houseDF["FullBath"] + houseDF["HalfBath"] + houseDF["KitchenAbvGr"])

houseDF['TotalQuality'] = houseDF['OverallQual'] + houseDF['OverallCond']

houseDF['TotalBath'] = (houseDF['FullBath'] + houseDF['HalfBath'] + houseDF['BsmtFullBath'] + houseDF['BsmtHalfBath'])

houseDF["TotalSF"] = houseDF["1stFlrSF"] + houseDF["2ndFlrSF"] + houseDF['TotalBsmtSF']
```

## Skewness

As mentioned while exploring the skewness of SalesPrice, the method
log1p is applied to some numerical features as well. The goal is to
create a dataset with features that are not skewed. The method unSkew is
selective of which features it picks to apply the log1p function to.
First, the feature must have a high skewness, and second, if the
skewness is worse after applying the log1p function, i.e. farther from
0, the unSkew method will reverse its changes on that feature. The table
[\[tab:unskew\]](#tab:unskew){reference-type="ref"
reference="tab:unskew"} shows the skewness of the numerical features
after unSkew() has been applied to them. For this table we used a unskew
threshold of **0.5**, where feature with a skewness under **0.5** are
not touched. Notice how some features even with a skewness above **0.5**
do not change. This is because after having the log1p method applied to
them, their skewness moved away from 0.

We experimented with different skewthresholds. It was found that it was
best to only unskew the extremely highly skewed feature, rather than to
applied a unskew method to everything. A final unskew threshold of
**1.5** was chosen based on figure [5](#fig:unskew){reference-type="ref"
reference="fig:unskew"}. Note, this means that the only feature that are
being unskewed are *SalePrice* and *TotalSF*.

[Change in model score, based on skewthreshold]{.image}

## Ordinal Encoding

There are several features that can be considered ordinal. For these
features, each feature's attributes were ranked on an integer scale. For
example, the feature PoolQC attributes: \"Ex\", \"Gd\", \"TA\", \"Fa\",
and "NA" were changed to 0, 1, 2, 3, 4 respectively. Notice that even
though Ex has been given a value of 0, and NA a value of 5 the only
thing that matters is that these values are ranked and ordered.
Assigning low values to "favorable" attributes results in a negative
correlation towards sales price.

[Correlation Matrix of Ordinal Features and Sales Prices]{.image}

Looking at figure [6](#fig:ordinalCorr){reference-type="ref"
reference="fig:ordinalCorr"} which shows the correlation between all the
ordinal data as well as sale price, we can see that most of the ordinal
data has a negative correlation with sales prices.

# Model Selection Using Gridsearch

## Data Scaling

Several different scaling techniques tested. These include: Standard
Scaler, MaxAbsScaler, Robust Scaler and MinMaxScaler.

### StandScaler

Standard scaling is a method used to scale values so that the mean of
the feature is 0 and the standard deviation is 1. The following equation
is used by the standard scaler. $$\begin{aligned}
z = \frac{x - u}{s}\end{aligned}$$ Standard scaling is a method used to
scale values so that the mean of the feature is 0 and the standard
deviation is 1. The following equation is used by the standard scaler.

### MaxAbsScaler

MaxAbsScaler scales the data in a feature to be proportionate to the
maximum absolute value of the data. The scaler uses the following
formula: $$\begin{aligned}
z = \frac{x}{a}\end{aligned}$$ Where x is the original feature value, a
is the maximum absolute value of the feature, and z is the new value.
This scaler ensures that every value in the feature is scaled between -1
and 1.

### RobustScaler

RobustScaler is a method that uses the median and interquartile range in
order to scale a feature in a way that is less affected by the presence
of outliers. The scaler uses the following formula: $$\begin{aligned}
z = \frac{x - m}{q}\end{aligned}$$ Where x is the original value, m is
the median, and q is the interquartile range. Z is the new value, scaled
between -1 and 1. Outliers that are 1.5x the IQR away from a quartile
are scaled to values below -1 or above 1, allowing them to be easily
identified or removed if desired.

### MinMaxScaler

The MinMaxScaler is used to normalize data so that every value in the
feature falls between 0 and 1. The following formula is used:
$$\begin{aligned}
z = \frac{x - a}{b-a}\end{aligned}$$ Where x is the original value, a is
the minimum value in the feature, and b is the maximum value. Z is the
resulting scaled value.

## Feature Selection

### Variance Threshold

Variance Threshold will remove all features which don't meet a certain
threshold of variance. Features which don't change or don't change very
often do not provide helpful information to the model. This threshold is
defined by: $$\begin{aligned}
Var[X] = p(1 - p)\end{aligned}$$

### GenericUnivariateSelect

The GenericUnivariateSelect is a generic feature selection model which
allows for quick and easy swapping between different score functions and
feature selection mode. We chose to use the f classifier which computes
the ANOVA f-value for our score function. Was used percentile at 1e-5 as
our feature selection mode.

## Models

There were four different models used for fitting the house prices.
These models were: Linear Regression, Ridge Regression, XGBRegressor,
and Bayesian Ridge Regression. Each of these models was tested against
different scalers and different feature selection. Pipelines were
created for each different combination. The code for generating the
pipelines can be found in appendix B. The table which shows the sorted
sources of each pipeline can be found in appendix A. Table
[\[tab:bestVall\]](#tab:bestVall){reference-type="ref"
reference="tab:bestVall"} and
[\[tab:worstVal\]](#tab:worstVal){reference-type="ref"
reference="tab:worstVal"} show the best two and worst two scores for
each model respectfully.

It was found the XGBRegressor consistently provided a larger score,
regardless of the scaler or feature selection. The XGBRegressor is
discussed further down.

### Linear Regression

First, we try a basic linear regression model to see how well our data
was processed. A linear regression is a mathematical model which finds
coefficients for each predictor variable that most closely predict the
outcome variable. This assumes a generally linear relationship between
the predictor variables and the outcome variable. The linear regression
resulted in scores of up to 0.75, the best of which is slightly better
than the example submission for this competition.

### Ridge Regression

Next, a ridge regression is used to attempt to fix issues caused by
multicollinearity in the dataset. Multicollinearity occurs when multiple
variables in the data have a near-linear relationship, causing least
squares estimates to have a large variance and therefore a suboptimal
model could be created. It appears that this dataset suffers from
multicollinearity to some degree, so this regression model was used to
see how much the accuracy could be affected. Here, the ridge regression
reaches a score of up to 0.752, slightly surpassing the best linear
regression score.

### Bayesian Ridge Regression

Next, a Bayesian Ridge regression was used. The result of bayesian ridge
regression is a regular ridge regression model, however the steps taken
to produce the model are different. Instead of identifying a single
value for the parameters of the ridge regression model, bayesian ridge
regression determines a probability distribution within which the
optimal value lies. This in turn causes the model to predict values
within a probability distribution. Using this model, we were able to
achieve a score of 0.78.

### XGBRegressor

Finally, the XGBoost library's XGBRegressor model was used. The XGBoost
library is built around an efficient and accurate implementation of the
gradient boosting method, and can be used to solve both classification
and regression problems. Gradient boosting is a technique used to modify
the effectiveness of a weak decision tree by adding it with another weak
tree, producing a larger, deeper tree that is slightly more accurate
than either alone. Using this model, we were able to achieve a score of
0.85.

## Gridsearch Results Analysis

In conclusion, it was found that the XGBRegressor consistently provides
the highscore. This was found across multiple scalers and feature
engineering techniques.

# Feature Engineering

## Filters

### High NaN Values

NaN's are common in most datasets, and a simple way to filter out less
useful features is to simply remove them if a significant enough portion
of their values are missing. In this case, the NaN threshold was set to
30%, meaning that a feature would be dropped if more than 30% of its
values were missing. No features were found to exceed this limit, so the
missing values were replaced by an average. While the mean of the
feature is usually used when possible, we chose to use the mode due to
the fact that some values that needed to be replaced were categorical.

It was mentioned that no features exceed the naN drop threshold of 0.3.
When looking at the relationship between the final model score and nan
drop threshold in figure [7](#fig:nanDropThreshold){reference-type="ref"
reference="fig:nanDropThreshold"} it can be seen that dropping features
with even very low amounts of nan values causes a drop in model score.
It is to note that the dataset was relatively clean and no feature
contained large amount of unwanted nan values.

[Change in model score, based on nan drop threshold]{.image}

### Correlation Matrix

In order to improve the quality of the model, feature selection was
performed on the input predictors to select the most informative
features. This has the effect of simplifying the model, and may make it
more generalizable by preventing overfitting on the training dataset.
Features were selected by measuring the correlation coefficient's of
each predictor feature with the target feature, SalePrice. Then,
features were removed from the dataset if their correlation values were
below a certain threshold. The absolute value of the coefficient was
used to preserve the importance of strong negative correlations, which
are still valuable in creating an effective model. The correlations of
each predictor were visualised by creating a matrix displaying each
predictor's correlation with every other predictor. The matrix of the
final features is shown in figure
[8](#fig:corrMatrix){reference-type="ref" reference="fig:corrMatrix"}.

[Correlation Matrix of Selected Features]{.image}

Here, we can see that most of the predictors remaining in the model have
either strong negative or positive correlations, indicating that they
will be useful for predicting our final outcome variable.

Like the nan threshold drop, the correlation threshold drop was chosen
by looking at how it effects the models final score. Looking at figure
[9](#fig:correlationThres){reference-type="ref"
reference="fig:correlationThres"} it can be seen that only dropping the
very low correlated features, i.e. less that 0.05 correlation, results
in the best model score. Similarly, we get the worst score if we chose
to drop most of low to mid correlated features and only use the high
correlated ones. A final correlation threshold of **0.05** was selected.

[Change in model score, based on correlation drop threshold]{.image}

## Wrappers

### SequentialFeatureSelector

In order to extract the most relevant features from the 238 that
remained after filtering, Sequential Feature Algorithms were used. SFA's
are greedy search algorithms that iterate over the list of features in a
dataset, adding or removing one of them in order to increase the
accuracy of the given model, repeating this process until only the
desired number of features remain. Sequential Forward Selection performs
the former, starting with 0 features and adding the feature that results
in the highest accuracy alone. The algorithm then determines which 2nd
feature to add that results in the highest accuracy when combined with
the initial feature. This process repeats until the desired number of
features are added. While this process finds a mostly optimal set of
features, there are some instances where the resulting feature set is
not as optimal as it could have been. This is due to the fact that each
feature is tested only with the features that have already been added,
meaning that there could potentially be a set of features that do not
include a feature that was selected early, but still result in a higher
accuracy. This is the downside to greedy search algorithms, as they only
choose the option that results in the best outcome at the current time,
and they are unable to see if that choice will be better in the future.

## Sequential Backward Selection

Sequential Backwards Selection works similarly to Forward Selection,
however it starts with the full set of features and removes one feature
at a time until it has the desired number of features. This method is
generally considered to be better than Forward Selection due to the fact
that it minimizes the chances of a feature being chosen only in the
context of an earlier chosen feature, however this can still occur to a
lesser extent since it is still a greedy algorithm.

# Hyperparameter Tuning

## RandomSearchCV

For selection hyperparameters the method used was RandomSearchCV.
RandomSearchCV takes in a dictionary of parameters for the model. Each
key in the parameter dictionary describes a range in which random values
can be generated on. The RandomSearchCV then performs a certain amount
of iterations where it tests new random values each time. For each
interaction k-fold cross validation is performed to get a better
confirmation on that iteration's score. When the RandomSearchCV comes
across a new best score, it saves the parameters. RandomSearchCV does
not cover all possible combinations. Often there are unreasonably high
numbers of combinations of parameters. Randomly testing between bounds
allows us to cover a wide range while keeping a relatively low
computation time.

## HalvingRandomSearchCV

HalvingRandomSearchCV is similar to RandomSearchCV. To begin,
HalvingRandomSearchCV picks n combinations. It then quickly evaluates
the combinations with a very small number of resources. The top half of
the combination candidates selected, and the process is done again, but
with higher resources. The process is repeated until a single
combination with the highest score remains.

# Results

## The Proposed Final Model

After testing with both RandomSearchCV, HalvingRandomSearchCV, and
Sequential Forward Selection a suitable arrangement of features and
hyperparameters were selected. We used the following hyperparameters:

``` {.Python}
XGB.XGBRegressor(base_score=0.5,
                 booster='gbtree',
                 colsample_bylevel=1,
                 colsample_bynode=1,
                 colsample_bytree=0.45,
                 gamma=0.045,
                 importance_type='gain',
                 learning_rate=0.05,
                 max_delta_step=0,
                 max_depth=5,
                 missing=None,
                 n_estimators=2200,
                 n_jobs=-1,
                 nthread=-1,
                 objective='reg:squarederror',
                 random_state=0,
                 reg_alpha=0.45,
                 reg_lambda=0.85,
                 scale_pos_weight=1,
                 seed=None,
                 silent=None,
                 subsample=0.52)
```

[Final Model]{.image}

The final validation score came out to 0.90. Our final model is
discribed in figure [10](#fig:databased){reference-type="ref"
reference="fig:databased"}.

## Kaggle Submission

After submitting to Kaggle our received a score of 0.12257 and a ranking
of 993. A screenshot of our submission can be found in appendix
[10.1](#appendix:score){reference-type="ref" reference="appendix:score"}

# Conclusion

In conclusion, the strength of the XGB Regressor was shown to be
invaluable to this project. With minimal preprocessing, this model
achieved a Mean Squared Error of 0.15, while a similarly preprocessed
linear regression had an MSE of 0.4. After many different preprocessing
methods involving skewing and feature selection, combined with
hyperparameter optimization, the XGB model was able to achieve a MSE of
0.12257.