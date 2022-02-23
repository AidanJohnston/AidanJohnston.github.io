---
layout: post
title: 'Predicting House Prices using Regression Techniques'
tags: Python Jupyter-Notebook Regression
category: colab
link: https://colab.research.google.com/drive/1nYI-q2O82n8hqQwLjqKrJ5QpPwWH7nCr?usp=sharing
---

The objective of this project is to develop a machine learning model capable of pre  dicting the sale price of a given house given a large set of explanatory variables. The model developed during this project will be submitted to an ongoing competition on Kaggle, which hosts a variety of machine learning competitions. 

During this project different regression techniques were tested.  We tested with different unskew methods and found that log1p is the best catch all method for our needs.  We preprocessed our data by combining similar features, removing unwanted NaN values, and encoding ordinal features.  We tested many feature selection, scaling and regression methods.  It was found that the MaxAbsScaler combined with XGBoost regression created the best validation scores.  We applied wrapper feature selection to pick the top 175 features to use for training.  We did hyperparameter tuning to find the best parameters for the XGBoost regressor.  The final validation R2 score was around 0.9 and our root mean squared logarithmic error after submitting to Kaggle was 0.12257.

## Data Exoploration


