library(ggplot2)
library(scales)


data = read.csv('48hdump.csv', header = TRUE, sep=",")
data$date = as.POSIXct(data$date, format="%Y-%m-%dT%H:%M:%S")
time_start = min(data$date)
data$date = difftime(data$date, time_start, unit = "hours")
head(data)


data$memory = factor(data$memory)
#data$deployment = factor(data$deployment)


cbPalette <- c("#999999", "#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7")

# Helper function to get rid of negative histogram values in log y scale
# https://stackoverflow.com/questions/41849951/using-ggplot-geo-geom-histogram-with-y-log-scale-with-zero-bins

mylog10_trans <- function (base = 10) 
{
  trans <- function(x) log(x + 1, base)
  inv <- function(x) base^x
  trans_new(paste0("log-", format(base)), trans, inv, log_breaks(base = base), 
            domain = c(1e-100, Inf))
}

##########################################################
# Google
##########################################################

data_google = data[data$provider=='google', ]
#data_google = data_google[data$deployment==1, ]
data_google = na.omit(data_google)#[!row.has.na, ]
ggplot(data_google) + 
	geom_point(aes(x=date,y=external,shape=memory,fill=macAddr,col=macAddr)) +
	scale_fill_discrete(name="RAM in MB", breaks=c("128","256","512","1024","2048")) + 
	guides(color=FALSE) +
  scale_shape_discrete(name="RAM in MB") +
 	ylab("Request processing time") + labs(title = "Google Cloud Functions") +
  xlim(0, 48) + 
  xlab("Experiment time in hours") +
  scale_x_continuous(breaks=c(0,12,24,36,48)) 
  #facet_grid(memory ~ .) 

ggsave("plot-google-instances.pdf", width = 16, height = 6, units = "cm")



##########################################################
# AWS
##########################################################


data_aws = data[data$provider=='aws', ]

ggplot(data_aws) + 
  geom_point(aes(x=date,y=external,shape=memory,fill=macAddr,col=macAddr)) +
  scale_fill_discrete(name="RAM in MB", breaks=c("128","256","512","1024","2048")) + 
  scale_shape_discrete(name="RAM in MB") +
  guides(color=FALSE) +
  ylab("Request processing time") + labs(title = "AWS Lambda") +
  xlim(0, 48) + 
  xlab("Experiment time in hours") +
  scale_x_continuous(breaks=c(0,12,24,36,48)) 
  #ylim(0, 25) + 
#  scale_y_continuous(breaks=c(4,5,6,7,8,9,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26)) +
  #facet_grid(memory ~ .) 

ggsave("plot-aws-instances.pdf", width = 16, height = 6, units = "cm")



##########################################################
# IBM
##########################################################

data_bluemix = data[data$provider=='bluemix',]

ggplot(data_bluemix) + 
  geom_point(aes(x=date,y=external,fill=macAddr,col=macAddr)) +
  scale_fill_discrete(name="RAM in MB", breaks=c("128","256","512","1024","2048")) + 
  guides(color=FALSE) +
  ylab("Request processing time") + labs(title = "IBM Cloud Functions") +
  #ylim(0, 10) + 
  xlim(0, 48) + 
  xlab("Experiment time in hours") +
  scale_x_continuous(breaks=c(0,12,24,36,48)) +
  facet_grid(memory ~ .) 


 ggsave("plot-bluemix-instances.pdf", width = 18, height = 6, units = "cm")


##########################################################
# Azure
##########################################################

data_azure = data[data$provider=='azure',]

ggplot(data_azure) + 
  geom_point(aes(x=date,y=external,color = "Dyn.")) +
  guides(color=FALSE) +
  #scale_fill_discrete(name="RAM in MB", breaks=c("Dyn.")) + 
  ylab("Request processing time") + labs(title = "Azure Functions") +
  #ylim(0, 25) + 
  xlim(0, 48) + 
  xlab("Experiment time in hours") +
  scale_x_continuous(breaks=c(0,12,24,36,48)) 

#  facet_grid(memory ~ .) 
  

ggsave("plot-azure-instances.pdf", width = 18, height = 4, units = "cm")

