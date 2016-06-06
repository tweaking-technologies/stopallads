#!/usr/bin/perl

#* This file is part of StopAll Ads <http://www.stopallads.com/>,
#* Copyright (C) 2016 Tweaking Techonologies

#* StopAll Ads is a fork of the Adblock Plus extension for 
#* blocking advertisements on the web. 
#* This fork will provide the same features as Adblock Plus

#* StopAll Ads is distributed in the hope that it will be useful,
#* but WITHOUT ANY WARRANTY; without even the implied warranty of
#* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#* GNU General Public License for more details.
#*
#* You should have received a copy of the GNU General Public License
#* along with StopAll Ads.  If not, see <http://www.gnu.org/licenses/>.


#Originally Contributed by:
 #* This file is part of Adblock Plus <https://adblockplus.org/>,
 #* Copyright (C) 2006-2016 Eyeo GmbH
 #*
 #* Adblock Plus is free software: you can redistribute it and/or modify
 #* it under the terms of the GNU General Public License version 3 as
 #* published by the Free Software Foundation.
 #*
 #* Adblock Plus is distributed in the hope that it will be useful,
 #* but WITHOUT ANY WARRANTY; without even the implied warranty of
 #* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 #* GNU General Public License for more details.
 #*
 #* You should have received a copy of the GNU General Public License
 #* along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.

use strict;

my $exec = 0;
for (my $i = 0; $i < @ARGV; $i++)
{
  if ($ARGV[$i] eq "-e")
  {
    $exec = 1;
    splice(@ARGV, $i--, 1);
  }
}

die "Usage: $^X $0 [-e] <regexp> <replaceBy>\n" unless @ARGV >= 2;
my ($from, $to) = @ARGV;

doDir('.');

sub doDir
{
  my $dir = shift;

  opendir(local *DIR, $dir) or die "Could not open directory $dir";
  foreach (readdir(DIR))
  {
    next if /^\./;

    my $path = "$dir/$_";
    if (-f $path)
    {
      doFile($path);
    }
    elsif (-d $path)
    {
      doDir($path);
    }
  }
  closedir(DIR);
}

sub doFile
{
  my $file = shift;

  print "$file\n";
  open(local *FILE, $file) or die "Could not read file $file";
  binmode(FILE);
  local $/;
  my $data = <FILE>;
  my $count;
  if ($exec)
  {
    $count = ($data =~ s/$from/$to/gee);
  }
  else
  {
    $count = ($data =~ s/$from/$to/g);
  }
  close(FILE);

  if ($count)
  {
    open(FILE, ">$file") or die "Could not write file $file";
    binmode(FILE);
    print FILE $data;
    close(FILE);
  }
}
