library(ggplot2)
library(lme4.0)
library(grid)

enhance.data.frame <- function(dat) {
  dat$Subj <- factor(paste("S",dat$subject))
  dat$Cond <- factor(ifelse(dat$hasOther=="True","X&OY",ifelse(dat$order=="subSuper","X&Y","Y&X")))
  dat$Freq <- dat$frequency
  dat$isFiller <- ! is.na(dat$filler)
  return(dat)
}

dat <- enhance.data.frame(read.table("roses-5-22.results",header=T,sep="\t"))
with(subset(dat,item=="flowers"),tapply(rating,list(Cond,frequency),mean))
with(subset(dat,item=="flowers"),tapply(rating,list(Cond,frequency),se))

dat.aggregated <- with(subset(dat, !isFiller),aggregate(list(rating=rating),list(item=item,Cond=Cond,Freq=Freq),mean))
dat.ses <- with(subset(dat, !isFiller),aggregate(list(rating=rating),list(item=item,Cond=Cond,Freq=Freq),se))
dat.sample.sizes <- with(subset(dat, !isFiller),aggregate(list(rating=rating),list(item=item,Cond=Cond,Freq=Freq),length))
dat.aggregated$se <- dat.ses$rating
dat.aggregated$N <- dat.sample.sizes$rating

d <- subset(dat.aggregated,item=="flowers")
dodge <- position_dodge(width=0.9)
pdf("~/tmp/flowers.pdf",width=6,height=4)
ggplot(d, aes(Freq, rating,fill=Cond)) +   
  geom_bar(position = dodge, stat="identity") + 
  geom_errorbar(aes(ymin=rating-se,ymax=rating+se),position=dodge,width=0.1)
dev.off()

plotIt <- function(theItem) {
  d <- subset(dat.aggregated,item==theItem)
  dodge <- position_dodge(width=0.9)
  ggplot(d, aes(Freq, rating,fill=Cond)) +   
    geom_bar(position = dodge, stat="identity") + 
    geom_errorbar(aes(ymin=rating-se,ymax=rating+se),position=dodge,width=0.1) +
    scale_y_continuous(limits=c(0,1)) +
    ggtitle(theItem)
}


pdf("~/tmp/X&OY-results-5-22.pdf",height=6,width=12)
vplayout <- function(x, y) viewport(layout.pos.row = x, layout.pos.col = y)
pushViewport(viewport(layout = grid.layout(2, 3)))
print(plotIt("flowers"), vp = vplayout(1, 1))
print(plotIt("animal"), vp = vplayout(1, 2))
print(plotIt("doctors"), vp = vplayout(1, 3))
print(plotIt("meat"), vp = vplayout(2, 1))
print(plotIt("trees"), vp = vplayout(2, 2))
print(plotIt("scientists"), vp = vplayout(2, 3))
dev.off()


testIt <- function(theItem) {
  contrasts(dat$Cond) <- contr.sum(3)
  contrasts(dat$Freq) <- contr.sum(2)
  m <- lm(rating ~ Cond*Freq,subset(dat,item==theItem))
  m0 <- lm(rating ~ Cond+Freq,subset(dat,item==theItem))
  anova(m0,m)  
}

testIt("flowers")
testIt("animal")
testIt("doctors")
testIt("meat")
testIt("trees")
testIt("scientists")



dat1 <- dat
dat <- rbind(dat)

contrasts(dat$Cond) <- contr.sum(3)
contrasts(dat$Freq) <- contr.sum(2)
m <- lm(rating ~ Cond*Freq,subset(dat,item=="flowers"))
m0 <- lm(rating ~ Cond+Freq,subset(dat,item=="flowers"))
anova(m0,m)

m <- lm(rating ~ Cond*Freq,subset(dat,item=="doctors"))
m0 <- lm(rating ~ Cond+Freq,subset(dat,item=="doctors"))
anova(m0,m)

m <- lm(rating ~ Cond*Freq,subset(dat,item=="meat"))
m0 <- lm(rating ~ Cond+Freq,subset(dat,item=="meat"))
anova(m0,m)

m <- lm(rating ~ Cond*Freq,subset(dat,item=="scientists"))
m0 <- lm(rating ~ Cond+Freq,subset(dat,item=="scientists"))
anova(m0,m)

m <- lm(rating ~ Cond*Freq,subset(dat,item=="trees"))
m0 <- lm(rating ~ Cond+Freq,subset(dat,item=="trees"))
anova(m0,m)

m <- lm(rating ~ Cond*Freq,subset(dat,item=="animal"))
m0 <- lm(rating ~ Cond+Freq,subset(dat,item=="animal"))
anova(m0,m)


dat.old <- enhance.data.frame(read.table("roses-4-14.results",header=T,sep="\t"))
